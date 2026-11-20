/**
 * Aggregation pipelines of the instance usage stats.
 *
 * Every computation happens in MongoDB: each pipeline returns the final shape
 * exposed by the GraphQL schema (`InstanceUsageStats`).
 * To keep them fast on large collections (articles and versions weigh gigabytes):
 * - documents are projected on the few fields needed, as early as possible;
 * - arrays are counted with `$size` rather than `$unwind`;
 * - a `$lookup` never scans a large collection on a non-indexed field:
 *   we start from the small collection, or group before looking up by `_id`.
 *
 * The pipelines are plain data: they can be pasted in mongosh to be measured.
 */

const ONE_WEEK_IN_DAYS = 7
const ONE_YEAR_AGO = {
  $dateSubtract: { startDate: '$$NOW', unit: 'year', amount: 1 },
}
const TWO_YEARS_AGO = {
  $dateSubtract: { startDate: '$$NOW', unit: 'year', amount: 2 },
}
// the example article is created along with the account
const EXAMPLE_ARTICLE_DELAY_IN_MS = 1000
const EXAMPLE_ARTICLE_MODIFIED_AFTER_IN_MS = 60 * 1000
const ONE_MINUTE_IN_MS = 60 * 1000
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000
// [name, from (included), to (excluded)]: time between the creation and the last update
const WRITING_DURATIONS = [
  ['underAMinute', Number.NEGATIVE_INFINITY, ONE_MINUTE_IN_MS],
  ['underAnHour', ONE_MINUTE_IN_MS, 60 * ONE_MINUTE_IN_MS],
  ['underADay', 60 * ONE_MINUTE_IN_MS, ONE_DAY_IN_MS],
  ['underAMonth', ONE_DAY_IN_MS, 30 * ONE_DAY_IN_MS],
  ['underAYear', 30 * ONE_DAY_IN_MS, 365 * ONE_DAY_IN_MS],
  ['moreThanAYear', 365 * ONE_DAY_IN_MS, Number.POSITIVE_INFINITY],
]
// metadata fields set by Stylo itself (the title is the one of the article)
const AUTOMATIC_METADATA_FIELDS = [
  'type',
  '@version',
  'link-citations',
  'nocite',
  'title',
]
// [name, from (included), to (excluded)]: number of filled metadata fields
const METADATA_LEVELS = [
  ['none', 0, 1],
  ['few', 1, 5],
  ['several', 5, 10],
  ['many', 10, Number.POSITIVE_INFINITY],
]
// values of a new article: a field still holding it is not counted as filled
const DEFAULT_METADATA_VALUES = [
  { k: 'lang', v: 'fr' },
  {
    k: 'license',
    v: 'Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
  },
]

const EMPTY_DISTRIBUTION = {
  mean: null,
  p10: null,
  median: null,
  p90: null,
  max: null,
}

/**
 * @param {string} path
 * @returns {object} expression: true when the value at `path` is a non-empty string
 */
function isNonEmptyString(path) {
  return { $and: [{ $eq: [{ $type: path }, 'string'] }, { $ne: [path, ''] }] }
}

/**
 * @param {object} condition
 * @returns {object} accumulator counting the documents matching `condition`
 */
function countIf(condition) {
  return { $sum: { $cond: [condition, 1, 0] } }
}

/**
 * @param {string} value expression of the value
 * @param {number} depth how deep to look into arrays and objects
 * @returns {object} expression: true when the value holds something
 * (a non-empty string, a number, a boolean, a date, or such a value nested in an array or an object)
 */
function isFilled(value, depth) {
  const variable = `nested${depth}`
  const nested = (input) =>
    depth > 0
      ? {
          $anyElementTrue: [
            {
              $map: {
                input,
                as: variable,
                in: isFilled(`$$${variable}`, depth - 1),
              },
            },
          ],
        }
      : true
  // nested $cond rather than $switch, whose `then` keys make the stages thenable
  const type = { $type: value }
  return {
    $cond: [
      { $eq: [type, 'string'] },
      { $ne: [value, ''] },
      {
        $cond: [
          { $in: [type, ['double', 'int', 'long', 'decimal', 'bool', 'date']] },
          true,
          {
            $cond: [
              { $isArray: value },
              nested(value),
              {
                $cond: [
                  { $eq: [type, 'object'] },
                  nested({
                    $map: {
                      input: { $objectToArray: value },
                      as: 'entry',
                      in: '$$entry.v',
                    },
                  }),
                  false,
                ],
              },
            ],
          },
        ],
      },
    ],
  }
}

/**
 * @param {string} path
 * @returns {object} expression: true when the value at `path` is a non-empty array
 */
function isNonEmptyArray(path) {
  return {
    $and: [
      { $isArray: path },
      { $gt: [{ $size: { $ifNull: [path, []] } }, 0] },
    ],
  }
}

/**
 * Accumulators of a distribution, to use in a `$group` stage
 * along with `distribution(name)` in the following `$project` stage.
 *
 * @param {string} name
 * @param {string|object} input
 * @returns {object} accumulators
 */
function distributionAccumulators(name, input) {
  return {
    [`${name}Mean`]: { $avg: input },
    [`${name}Percentiles`]: {
      $percentile: { input, p: [0.1, 0.5, 0.9], method: 'approximate' },
    },
    [`${name}Max`]: { $max: input },
  }
}

/**
 * @param {string} name
 * @returns {object} projection of the accumulators of `distributionAccumulators(name)`
 */
function distribution(name) {
  const percentile = (index) => ({
    $round: [{ $arrayElemAt: [`$${name}Percentiles`, index] }, 1],
  })
  return {
    mean: { $round: [`$${name}Mean`, 1] },
    p10: percentile(0),
    median: percentile(1),
    p90: percentile(2),
    max: { $round: [`$${name}Max`, 1] },
  }
}

/**
 * @param {string} facet
 * @param {string} field
 * @param {any} defaultValue
 * @returns {object} expression: the field of the single document of a snapshot facet
 */
function fromSnapshot(facet, field, defaultValue) {
  return {
    $ifNull: [
      { $getField: { field, input: { $first: `$${facet}` } } },
      defaultValue,
    ],
  }
}

const AUTHENTICATION_METHODS = ['password', 'humanid', 'zotero', 'hypothesis']

/**
 * Collection: users.
 * Users by authentication method (available on the account, not the one used to log in),
 * and per year: created accounts, deleted accounts, last connection.
 */
const users = [
  {
    $project: {
      createdAt: 1,
      deletedAt: 1,
      connectedAt: 1,
      password: { $toInt: isNonEmptyString('$password') },
      humanid: {
        $toInt: {
          $or: [
            isNonEmptyString('$authProviders.humanid.id'),
            isNonEmptyString('$authProviders.humanid.email'),
          ],
        },
      },
      zotero: { $toInt: isNonEmptyString('$authProviders.zotero.id') },
      hypothesis: { $toInt: isNonEmptyString('$authProviders.hypothesis.id') },
    },
  },
  {
    $facet: {
      snapshot: [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            ...Object.fromEntries(
              AUTHENTICATION_METHODS.map((method) => [
                method,
                { $sum: `$${method}` },
              ])
            ),
            multiple: countIf({
              $gt: [
                { $add: AUTHENTICATION_METHODS.map((method) => `$${method}`) },
                1,
              ],
            }),
          },
        },
      ],
      years: [
        {
          $project: {
            _id: 0,
            events: [
              { year: { $year: '$createdAt' }, kind: 'created' },
              { year: { $year: '$deletedAt' }, kind: 'deleted' },
              { year: { $year: '$connectedAt' }, kind: 'lastConnected' },
            ],
          },
        },
        { $unwind: '$events' },
        { $match: { 'events.year': { $type: 'number' } } },
        {
          $group: {
            _id: '$events.year',
            created: countIf({ $eq: ['$events.kind', 'created'] }),
            deleted: countIf({ $eq: ['$events.kind', 'deleted'] }),
            lastConnected: countIf({ $eq: ['$events.kind', 'lastConnected'] }),
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            year: '$_id',
            created: 1,
            deleted: 1,
            lastConnected: 1,
          },
        },
      ],
    },
  },
  {
    $project: {
      total: fromSnapshot('snapshot', 'total', 0),
      authentication: Object.fromEntries(
        [...AUTHENTICATION_METHODS, 'multiple'].map((method) => [
          method,
          fromSnapshot('snapshot', method, 0),
        ])
      ),
      years: 1,
    },
  },
]

/**
 * Collection: articles.
 * Shared articles, articles in a corpus or in a workspace,
 * and per year: created articles, last updated articles,
 * created articles that are now in a workspace.
 * The example article created with each account is not counted,
 * except in the last updated articles once it has been modified.
 */
const articles = [
  {
    $project: {
      owner: 1,
      createdAt: 1,
      updatedAt: 1,
      shared: { $gt: [{ $size: { $ifNull: ['$contributors', []] } }, 0] },
      withZotero: isNonEmptyString('$zoteroLink'),
      tags: { $size: { $ifNull: ['$tags', []] } },
      // the author and the contributors
      collaborators: {
        $size: {
          $setUnion: [['$owner'], { $ifNull: ['$contributors.user', []] }],
        },
      },
      // BibTeX entries: lines starting with `@`
      // (splitting is much faster than $regexFindAll on large bibliographies)
      bibliographyEntries: {
        $cond: [
          { $eq: [{ $type: '$workingVersion.bib' }, 'string'] },
          {
            $add: [
              {
                $subtract: [
                  { $size: { $split: ['$workingVersion.bib', '\n@'] } },
                  1,
                ],
              },
              {
                $cond: [
                  {
                    $eq: [
                      {
                        $substrCP: [
                          { $ltrim: { input: '$workingVersion.bib' } },
                          0,
                          1,
                        ],
                      },
                      '@',
                    ],
                  },
                  1,
                  0,
                ],
              },
            ],
          },
          0,
        ],
      },
      // the metadata always has every field: only filled ones are counted
      withMetadata: {
        $or: [
          isNonEmptyArray('$workingVersion.metadata.authors'),
          isNonEmptyString('$workingVersion.metadata.abstract'),
          isNonEmptyArray('$workingVersion.metadata.keywords'),
          isNonEmptyString('$workingVersion.metadata.keywords'),
        ],
      },
      // filled fields of the metadata, whatever the type of document
      metadataFields: {
        $size: {
          $filter: {
            input: {
              $objectToArray: { $ifNull: ['$workingVersion.metadata', {}] },
            },
            as: 'field',
            cond: {
              $and: [
                { $not: [{ $in: ['$$field.k', AUTOMATIC_METADATA_FIELDS] }] },
                { $not: [{ $in: ['$$field', DEFAULT_METADATA_VALUES] }] },
                isFilled('$$field.v', 3),
              ],
            },
          },
        },
      },
    },
  },
  // the example article is the first article of an account,
  // created along with it (less than a second after the signup)
  {
    $setWindowFields: {
      partitionBy: '$owner',
      sortBy: { createdAt: 1 },
      output: { rank: { $documentNumber: {} } },
    },
  },
  // only the first article of each account looks up its owner
  {
    $set: {
      firstOf: { $cond: [{ $eq: ['$rank', 1] }, '$owner', null] },
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'firstOf',
      foreignField: '_id',
      as: 'signup',
      pipeline: [{ $project: { _id: 0, createdAt: 1 } }],
    },
  },
  {
    $project: {
      article: { $literal: true },
      owner: 1,
      createdAt: 1,
      updatedAt: 1,
      shared: 1,
      collaborators: 1,
      withZotero: 1,
      tags: 1,
      bibliographyEntries: 1,
      withMetadata: 1,
      metadataFields: 1,
      isExample: {
        $let: {
          vars: { signedUpAt: { $first: '$signup.createdAt' } },
          in: {
            $and: [
              { $eq: [{ $type: '$createdAt' }, 'date'] },
              { $eq: [{ $type: '$$signedUpAt' }, 'date'] },
              {
                $lte: [
                  { $abs: { $subtract: ['$createdAt', '$$signedUpAt'] } },
                  EXAMPLE_ARTICLE_DELAY_IN_MS,
                ],
              },
            ],
          },
        },
      },
      modified: {
        $gt: [
          { $subtract: ['$updatedAt', '$createdAt'] },
          EXAMPLE_ARTICLE_MODIFIED_AFTER_IN_MS,
        ],
      },
    },
  },
  // an example article never modified is not an activity
  { $match: { $expr: { $or: [{ $not: ['$isExample'] }, '$modified'] } } },
  // articles of the workspaces and of the corpora, gathered without any lookup
  {
    $unionWith: {
      coll: 'workspaces',
      pipeline: [
        {
          $project: {
            _id: 0,
            articles: 1,
            members: { $size: { $ifNull: ['$members', []] } },
          },
        },
        { $unwind: '$articles' },
        {
          $project: {
            _id: '$articles',
            inWorkspace: { $literal: true },
            workspaceMembers: '$members',
          },
        },
      ],
    },
  },
  {
    $unionWith: {
      coll: 'corpus',
      pipeline: [
        {
          $project: {
            _id: 0,
            articles: 1,
            size: { $size: { $ifNull: ['$articles', []] } },
          },
        },
        { $unwind: '$articles' },
        {
          $project: {
            _id: '$articles.article',
            inCorpus: { $literal: true },
            corpusSize: '$size',
          },
        },
      ],
    },
  },
  {
    $group: {
      _id: '$_id',
      article: { $max: '$article' },
      createdAt: { $max: '$createdAt' },
      updatedAt: { $max: '$updatedAt' },
      owner: { $max: '$owner' },
      shared: { $max: '$shared' },
      collaborators: { $max: '$collaborators' },
      withZotero: { $max: '$withZotero' },
      tags: { $max: '$tags' },
      bibliographyEntries: { $max: '$bibliographyEntries' },
      withMetadata: { $max: '$withMetadata' },
      metadataFields: { $max: '$metadataFields' },
      isExample: { $max: '$isExample' },
      inWorkspace: { $max: '$inWorkspace' },
      // members of all the workspaces of the article (a member of two is counted twice)
      workspaceMembers: { $sum: '$workspaceMembers' },
      inCorpus: { $max: '$inCorpus' },
      // size of its largest corpus
      corpusSize: { $max: '$corpusSize' },
    },
  },
  // ignores the references to deleted (or never modified example) articles
  { $match: { article: true } },
  {
    $facet: {
      snapshot: [
        { $match: { isExample: false } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            createdLastTwelveMonths: countIf({
              $gte: ['$createdAt', ONE_YEAR_AGO],
            }),
            shared: countIf('$shared'),
            inWorkspace: countIf({ $eq: ['$inWorkspace', true] }),
            inCorpus: countIf({ $eq: ['$inCorpus', true] }),
            withBibliography: countIf({ $gt: ['$bibliographyEntries', 0] }),
            withMetadata: countIf('$withMetadata'),
            bibliographiesFromZotero: countIf({
              $and: [{ $gt: ['$bibliographyEntries', 0] }, '$withZotero'],
            }),
            withTags: countIf({ $gt: ['$tags', 0] }),
            ...Object.fromEntries(
              METADATA_LEVELS.map(([name, from, to]) => [
                `metadata_${name}`,
                countIf({
                  $and: [
                    { $gte: ['$metadataFields', from] },
                    { $lt: ['$metadataFields', to] },
                  ],
                }),
              ])
            ),
            ...distributionAccumulators('tags', {
              $cond: [{ $gt: ['$tags', 0] }, '$tags', null],
            }),
            // time between the creation and the last update
            ...Object.fromEntries(
              WRITING_DURATIONS.map(([name, from, to]) => [
                name,
                countIf({
                  $and: [
                    {
                      $gte: [{ $subtract: ['$updatedAt', '$createdAt'] }, from],
                    },
                    { $lt: [{ $subtract: ['$updatedAt', '$createdAt'] }, to] },
                  ],
                }),
              ])
            ),
            ...distributionAccumulators('writingDays', {
              $cond: [
                {
                  $gte: [
                    { $subtract: ['$updatedAt', '$createdAt'] },
                    ONE_MINUTE_IN_MS,
                  ],
                },
                {
                  $divide: [
                    { $subtract: ['$updatedAt', '$createdAt'] },
                    ONE_DAY_IN_MS,
                  ],
                },
                null,
              ],
            }),
            ...distributionAccumulators('bibliographyEntries', {
              $cond: [
                { $gt: ['$bibliographyEntries', 0] },
                '$bibliographyEntries',
                null,
              ],
            }),
            ...distributionAccumulators('collaborators', {
              $cond: ['$shared', '$collaborators', null],
            }),
            ...distributionAccumulators('workspaceMembers', {
              $cond: [
                { $eq: ['$inWorkspace', true] },
                '$workspaceMembers',
                null,
              ],
            }),
            ...distributionAccumulators('corpusSize', {
              $cond: [{ $eq: ['$inCorpus', true] }, '$corpusSize', null],
            }),
            ...distributionAccumulators('metadataFields', {
              $cond: ['$withMetadata', '$metadataFields', null],
            }),
          },
        },
        {
          $set: {
            bibliographyEntries: distribution('bibliographyEntries'),
            collaborators: distribution('collaborators'),
            workspaceMembers: distribution('workspaceMembers'),
            corpusSize: distribution('corpusSize'),
            metadataFields: distribution('metadataFields'),
            tags: distribution('tags'),
            writingDays: distribution('writingDays'),
          },
        },
      ],
      perOwner: [
        { $match: { isExample: false, owner: { $type: 'objectId' } } },
        { $group: { _id: '$owner', articles: { $sum: 1 } } },
        {
          $group: {
            _id: null,
            ...distributionAccumulators('articles', '$articles'),
          },
        },
        { $project: { _id: 0, articles: distribution('articles') } },
      ],
      years: [
        {
          $project: {
            _id: 0,
            events: [
              {
                year: {
                  $cond: ['$isExample', null, { $year: '$createdAt' }],
                },
                kind: 'created',
              },
              { year: { $year: '$updatedAt' }, kind: 'lastUpdated' },
              {
                year: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$inWorkspace', true] },
                        { $not: ['$isExample'] },
                      ],
                    },
                    { $year: '$createdAt' },
                    null,
                  ],
                },
                kind: 'inWorkspace',
              },
            ],
          },
        },
        { $unwind: '$events' },
        { $match: { 'events.year': { $type: 'number' } } },
        {
          $group: {
            _id: '$events.year',
            created: countIf({ $eq: ['$events.kind', 'created'] }),
            lastUpdated: countIf({ $eq: ['$events.kind', 'lastUpdated'] }),
            inWorkspace: countIf({ $eq: ['$events.kind', 'inWorkspace'] }),
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            year: '$_id',
            created: 1,
            lastUpdated: 1,
            inWorkspace: 1,
          },
        },
      ],
    },
  },
  {
    $project: {
      total: fromSnapshot('snapshot', 'total', 0),
      createdLastTwelveMonths: fromSnapshot(
        'snapshot',
        'createdLastTwelveMonths',
        0
      ),
      shared: fromSnapshot('snapshot', 'shared', 0),
      inWorkspace: fromSnapshot('snapshot', 'inWorkspace', 0),
      inCorpus: fromSnapshot('snapshot', 'inCorpus', 0),
      withBibliography: fromSnapshot('snapshot', 'withBibliography', 0),
      bibliographyEntries: fromSnapshot(
        'snapshot',
        'bibliographyEntries',
        EMPTY_DISTRIBUTION
      ),
      withMetadata: fromSnapshot('snapshot', 'withMetadata', 0),
      bibliographiesFromZotero: fromSnapshot(
        'snapshot',
        'bibliographiesFromZotero',
        0
      ),
      withTags: fromSnapshot('snapshot', 'withTags', 0),
      metadataLevels: Object.fromEntries(
        METADATA_LEVELS.map(([name]) => [
          name,
          fromSnapshot('snapshot', `metadata_${name}`, 0),
        ])
      ),
      tags: fromSnapshot('snapshot', 'tags', EMPTY_DISTRIBUTION),
      writingDays: fromSnapshot('snapshot', 'writingDays', EMPTY_DISTRIBUTION),
      writingDurations: Object.fromEntries(
        WRITING_DURATIONS.map(([name]) => [
          name,
          fromSnapshot('snapshot', name, 0),
        ])
      ),
      collaborators: fromSnapshot(
        'snapshot',
        'collaborators',
        EMPTY_DISTRIBUTION
      ),
      workspaceMembers: fromSnapshot(
        'snapshot',
        'workspaceMembers',
        EMPTY_DISTRIBUTION
      ),
      corpusSize: fromSnapshot('snapshot', 'corpusSize', EMPTY_DISTRIBUTION),
      metadataFields: fromSnapshot(
        'snapshot',
        'metadataFields',
        EMPTY_DISTRIBUTION
      ),
      perOwner: fromSnapshot('perOwner', 'articles', EMPTY_DISTRIBUTION),
      years: 1,
    },
  },
]

/**
 * Collection: articles.
 * Active users per year. A user is active a given year when, that year:
 * - they created an article, at least one week after their signup;
 * - an article they own or which is shared with them was last updated,
 *   at least one week after their signup (the writer is not recorded);
 * - they are a contributor of an article created that year;
 * - they are a member of a workspace in which an article was created that year.
 * The week after the signup ignores the default article, created with the account.
 * Versions are not used: automatic versions (signup, editing sessions) make them noisy.
 */
const activity = [
  {
    $project: {
      _id: 0,
      events: {
        $concatArrays: [
          [{ who: '$owner', at: '$createdAt', kind: 'created' }],
          {
            $map: {
              input: {
                $setUnion: [
                  ['$owner'],
                  { $ifNull: ['$contributors.user', []] },
                ],
              },
              as: 'person',
              in: { who: '$$person', at: '$updatedAt', kind: 'updated' },
            },
          },
          {
            $map: {
              input: { $ifNull: ['$contributors.user', []] },
              as: 'contributor',
              in: { who: '$$contributor', at: '$createdAt', kind: 'shared' },
            },
          },
        ],
      },
    },
  },
  { $unwind: '$events' },
  { $replaceWith: '$events' },
  // starts from the (few) workspaces, and fetches the article dates by _id
  {
    $unionWith: {
      coll: 'workspaces',
      pipeline: [
        { $project: { members: '$members.user', articles: 1 } },
        { $unwind: '$articles' },
        {
          $lookup: {
            from: 'articles',
            localField: 'articles',
            foreignField: '_id',
            as: 'article',
            pipeline: [{ $project: { createdAt: 1 } }],
          },
        },
        { $unwind: '$members' },
        {
          $project: {
            _id: 0,
            who: '$members',
            at: { $first: '$article.createdAt' },
            kind: 'workspace',
          },
        },
      ],
    },
  },
  // current members of a workspace (the membership is not dated)
  {
    $unionWith: {
      coll: 'workspaces',
      pipeline: [
        { $project: { _id: 0, who: '$members.user' } },
        { $unwind: '$who' },
        { $set: { kind: 'member' } },
      ],
    },
  },
  {
    $match: {
      who: { $type: 'objectId' },
      $or: [{ at: { $type: 'date' } }, { kind: 'member' }],
    },
  },
  // a single user lookup per user (rather than per article)
  {
    $group: {
      _id: '$who',
      events: {
        $push: {
          $cond: [
            { $eq: ['$kind', 'member'] },
            '$$REMOVE',
            { at: '$at', kind: '$kind' },
          ],
        },
      },
      isMember: { $max: { $eq: ['$kind', 'member'] } },
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: '_id',
      foreignField: '_id',
      as: 'user',
      pipeline: [{ $project: { createdAt: 1 } }],
    },
  },
  // ignores the references to users that no longer exist
  { $match: { 'user.0': { $exists: true } } },
  {
    $set: {
      oneWeekAfterSignup: {
        $dateAdd: {
          startDate: { $first: '$user.createdAt' },
          unit: 'day',
          amount: ONE_WEEK_IN_DAYS,
        },
      },
    },
  },
  // dates of the activities that count (see above)
  {
    $set: {
      activeAt: {
        $map: {
          input: {
            $filter: {
              input: '$events',
              cond: {
                $or: [
                  { $in: ['$$this.kind', ['shared', 'workspace']] },
                  { $gte: ['$$this.at', '$oneWeekAfterSignup'] },
                ],
              },
            },
          },
          in: '$$this.at',
        },
      },
    },
  },
  {
    $set: {
      years: {
        $setUnion: [{ $map: { input: '$activeAt', in: { $year: '$$this' } } }],
      },
    },
  },
  {
    $facet: {
      years: [
        { $set: { year: '$years' } },
        { $unwind: '$year' },
        // years since the signup (calendar years)
        {
          $set: {
            seniority: {
              $subtract: ['$year', { $year: { $first: '$user.createdAt' } }],
            },
          },
        },
        {
          $group: {
            _id: '$year',
            activeUsers: { $sum: 1 },
            retainedNextYear: countIf({
              $in: [{ $add: ['$year', 1] }, '$years'],
            }),
            inWorkspace: countIf('$isMember'),
            sameYear: countIf({ $lte: ['$seniority', 0] }),
            oneToTwoYears: countIf({
              $and: [{ $gte: ['$seniority', 1] }, { $lte: ['$seniority', 2] }],
            }),
            threeToFiveYears: countIf({
              $and: [{ $gte: ['$seniority', 3] }, { $lte: ['$seniority', 5] }],
            }),
            moreThanFiveYears: countIf({ $gt: ['$seniority', 5] }),
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            year: '$_id',
            activeUsers: 1,
            inWorkspace: 1,
            seniority: {
              sameYear: '$sameYear',
              oneToTwoYears: '$oneToTwoYears',
              threeToFiveYears: '$threeToFiveYears',
              moreThanFiveYears: '$moreThanFiveYears',
            },
            // the next year is not over (or has not started) yet
            retainedNextYear: {
              $cond: [
                { $gte: ['$_id', { $year: '$$NOW' }] },
                null,
                '$retainedNextYear',
              ],
            },
          },
        },
      ],
      // rolling window: the last 12 months, and the 12 months before
      lastTwelveMonths: [
        {
          $set: {
            last: {
              $anyElementTrue: [
                {
                  $map: {
                    input: '$activeAt',
                    in: { $gte: ['$$this', ONE_YEAR_AGO] },
                  },
                },
              ],
            },
            previous: {
              $anyElementTrue: [
                {
                  $map: {
                    input: '$activeAt',
                    in: {
                      $and: [
                        { $gte: ['$$this', TWO_YEARS_AGO] },
                        { $lt: ['$$this', ONE_YEAR_AGO] },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            activeUsers: countIf('$last'),
            previousActiveUsers: countIf('$previous'),
            retained: countIf({ $and: ['$last', '$previous'] }),
          },
        },
        { $project: { _id: 0 } },
      ],
    },
  },
  {
    $project: {
      years: 1,
      lastTwelveMonths: {
        $ifNull: [
          { $first: '$lastTwelveMonths' },
          { activeUsers: 0, previousActiveUsers: 0, retained: 0 },
        ],
      },
    },
  },
]

/**
 * Collection: articles.
 * Per signup year (cohort): distribution of the time between the signup
 * and the last known activity (last connection, or last update of an article
 * they own or which is shared with them), accounts which never came back
 * after their first day, and accounts which came back after 30 days and after a year
 * (among the accounts old enough); and the same distribution over all the accounts
 * used after their first day.
 */
const retention = [
  {
    $project: {
      _id: 0,
      who: {
        $setUnion: [['$owner'], { $ifNull: ['$contributors.user', []] }],
      },
      at: { $max: ['$createdAt', '$updatedAt'] },
    },
  },
  { $unwind: '$who' },
  {
    $unionWith: {
      coll: 'users',
      pipeline: [
        {
          $project: {
            _id: 0,
            who: '$_id',
            at: '$connectedAt',
            signedUpAt: '$createdAt',
          },
        },
      ],
    },
  },
  {
    $group: {
      _id: '$who',
      lastActivityAt: { $max: '$at' },
      signedUpAt: { $max: '$signedUpAt' },
    },
  },
  // ignores the references to users that no longer exist
  { $match: { signedUpAt: { $type: 'date' } } },
  {
    $set: {
      lifespanHours: {
        $dateDiff: {
          startDate: '$signedUpAt',
          endDate: { $max: ['$lastActivityAt', '$signedUpAt'] },
          unit: 'hour',
        },
      },
      ageInDays: {
        $dateDiff: { startDate: '$signedUpAt', endDate: '$$NOW', unit: 'day' },
      },
    },
  },
  { $set: { lifespanDays: { $divide: ['$lifespanHours', 24] } } },
  {
    $facet: {
      cohorts: [
        {
          $group: {
            _id: { $year: '$signedUpAt' },
            accounts: { $sum: 1 },
            ...distributionAccumulators('lifespan', '$lifespanDays'),
            oneDayOnly: countIf({ $lt: ['$lifespanHours', 24] }),
            eligibleAfter30Days: countIf({ $gte: ['$ageInDays', 30] }),
            returnedAfter30Days: countIf({
              $and: [
                { $gte: ['$ageInDays', 30] },
                { $gte: ['$lifespanDays', 30] },
              ],
            }),
            eligibleAfter1Year: countIf({ $gte: ['$ageInDays', 365] }),
            returnedAfter1Year: countIf({
              $and: [
                { $gte: ['$ageInDays', 365] },
                { $gte: ['$lifespanDays', 365] },
              ],
            }),
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            year: '$_id',
            accounts: 1,
            lifespanDays: distribution('lifespan'),
            oneDayOnly: 1,
            returnedAfter30Days: {
              eligible: '$eligibleAfter30Days',
              returned: '$returnedAfter30Days',
            },
            returnedAfter1Year: {
              eligible: '$eligibleAfter1Year',
              returned: '$returnedAfter1Year',
            },
          },
        },
      ],
      // all the accounts used after their first day
      overall: [
        { $match: { lifespanHours: { $gte: 24 } } },
        {
          $group: {
            _id: null,
            accounts: { $sum: 1 },
            ...distributionAccumulators('lifespan', '$lifespanDays'),
          },
        },
        {
          $project: {
            _id: 0,
            accounts: 1,
            lifespanDays: distribution('lifespan'),
          },
        },
      ],
    },
  },
  {
    $project: {
      cohorts: 1,
      overall: {
        $ifNull: [
          { $first: '$overall' },
          { accounts: 0, lifespanDays: EMPTY_DISTRIBUTION },
        ],
      },
    },
  },
]

/**
 * Facet: documents created per month (months without creation included,
 * from the first to the last creation) and their running total.
 */
const monthlyCreations = [
  { $match: { createdAt: { $type: 'date' } } },
  {
    $group: {
      _id: { $dateTrunc: { date: '$createdAt', unit: 'month' } },
      created: { $sum: 1 },
    },
  },
  {
    $densify: {
      field: '_id',
      range: { step: 1, unit: 'month', bounds: 'full' },
    },
  },
  {
    $setWindowFields: {
      sortBy: { _id: 1 },
      output: {
        total: {
          $sum: { $ifNull: ['$created', 0] },
          window: { documents: ['unbounded', 'current'] },
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      month: { $dateToString: { date: '$_id', format: '%Y-%m' } },
      created: { $ifNull: ['$created', 0] },
      total: 1,
    },
  },
]

/**
 * Collection: corpus.
 * Corpora by type, distribution of their number of articles,
 * and per creation year: created corpora and their (current) number of articles.
 */
const corpora = [
  {
    $project: {
      createdAt: 1,
      type: { $ifNull: ['$type', 'neutral'] },
      articles: { $size: { $ifNull: ['$articles', []] } },
    },
  },
  {
    $facet: {
      snapshot: [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            createdLastTwelveMonths: countIf({
              $gte: ['$createdAt', ONE_YEAR_AGO],
            }),
            ...distributionAccumulators('articles', '$articles'),
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            createdLastTwelveMonths: 1,
            articles: distribution('articles'),
          },
        },
      ],
      types: [
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $project: { _id: 0, type: '$_id', count: 1 } },
      ],
      years: [
        { $match: { createdAt: { $type: 'date' } } },
        {
          $group: {
            _id: { $year: '$createdAt' },
            created: { $sum: 1 },
            ...distributionAccumulators('articles', '$articles'),
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            year: '$_id',
            created: 1,
            articles: distribution('articles'),
          },
        },
      ],
      months: monthlyCreations,
    },
  },
  {
    $project: {
      total: fromSnapshot('snapshot', 'total', 0),
      createdLastTwelveMonths: fromSnapshot(
        'snapshot',
        'createdLastTwelveMonths',
        0
      ),
      articles: fromSnapshot('snapshot', 'articles', EMPTY_DISTRIBUTION),
      types: 1,
      years: 1,
      months: 1,
    },
  },
]

/**
 * Collection: workspaces.
 * Distinct members, distribution of the number of members and of articles,
 * and per creation year: created workspaces with their (current) members and articles.
 */
const workspaces = [
  {
    $project: {
      createdAt: 1,
      memberIds: { $ifNull: ['$members.user', []] },
      members: { $size: { $ifNull: ['$members', []] } },
      articles: { $size: { $ifNull: ['$articles', []] } },
    },
  },
  {
    $facet: {
      snapshot: [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            ...distributionAccumulators('members', '$members'),
            ...distributionAccumulators('articles', '$articles'),
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            members: distribution('members'),
            articles: distribution('articles'),
          },
        },
      ],
      distinctMembers: [
        { $unwind: '$memberIds' },
        { $group: { _id: '$memberIds' } },
        { $count: 'count' },
      ],
      years: [
        { $match: { createdAt: { $type: 'date' } } },
        {
          $group: {
            _id: { $year: '$createdAt' },
            created: { $sum: 1 },
            ...distributionAccumulators('members', '$members'),
            ...distributionAccumulators('articles', '$articles'),
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            year: '$_id',
            created: 1,
            members: distribution('members'),
            articles: distribution('articles'),
          },
        },
      ],
      months: monthlyCreations,
    },
  },
  {
    $project: {
      total: fromSnapshot('snapshot', 'total', 0),
      distinctMembers: fromSnapshot('distinctMembers', 'count', 0),
      members: fromSnapshot('snapshot', 'members', EMPTY_DISTRIBUTION),
      articles: fromSnapshot('snapshot', 'articles', EMPTY_DISTRIBUTION),
      years: 1,
      months: 1,
    },
  },
]

module.exports = {
  users,
  articles,
  activity,
  retention,
  corpora,
  workspaces,
}
