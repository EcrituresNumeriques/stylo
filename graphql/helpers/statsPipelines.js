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

const EMPTY_DISTRIBUTION = { mean: null, p10: null, median: null, p90: null }

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
 */
const articles = [
  {
    $project: {
      article: { $literal: true },
      createdAt: 1,
      updatedAt: 1,
      shared: { $gt: [{ $size: { $ifNull: ['$contributors', []] } }, 0] },
    },
  },
  // articles of the workspaces and of the corpora, gathered without any lookup
  {
    $unionWith: {
      coll: 'workspaces',
      pipeline: [
        { $project: { _id: 0, articles: 1 } },
        { $unwind: '$articles' },
        { $project: { _id: '$articles', inWorkspace: { $literal: true } } },
      ],
    },
  },
  {
    $unionWith: {
      coll: 'corpus',
      pipeline: [
        { $project: { _id: 0, articles: 1 } },
        { $unwind: '$articles' },
        {
          $project: { _id: '$articles.article', inCorpus: { $literal: true } },
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
      shared: { $max: '$shared' },
      inWorkspace: { $max: '$inWorkspace' },
      inCorpus: { $max: '$inCorpus' },
    },
  },
  // ignores the references to deleted articles
  { $match: { article: true } },
  {
    $facet: {
      snapshot: [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            shared: countIf('$shared'),
            inWorkspace: countIf({ $eq: ['$inWorkspace', true] }),
            inCorpus: countIf({ $eq: ['$inCorpus', true] }),
          },
        },
      ],
      years: [
        {
          $project: {
            _id: 0,
            events: [
              { year: { $year: '$createdAt' }, kind: 'created' },
              { year: { $year: '$updatedAt' }, kind: 'lastUpdated' },
              {
                year: {
                  $cond: [
                    { $eq: ['$inWorkspace', true] },
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
      shared: fromSnapshot('snapshot', 'shared', 0),
      inWorkspace: fromSnapshot('snapshot', 'inWorkspace', 0),
      inCorpus: fromSnapshot('snapshot', 'inCorpus', 0),
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
  { $match: { who: { $type: 'objectId' }, at: { $type: 'date' } } },
  // a single user lookup per user (rather than per article)
  { $group: { _id: '$who', events: { $push: { at: '$at', kind: '$kind' } } } },
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
  {
    $set: {
      years: {
        $setUnion: [
          {
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
              in: { $year: '$$this.at' },
            },
          },
        ],
      },
    },
  },
  { $set: { year: '$years' } },
  { $unwind: '$year' },
  {
    $group: {
      _id: '$year',
      activeUsers: { $sum: 1 },
      retainedNextYear: countIf({ $in: [{ $add: ['$year', 1] }, '$years'] }),
    },
  },
  { $sort: { _id: 1 } },
  {
    $project: {
      _id: 0,
      year: '$_id',
      activeUsers: 1,
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
]

/**
 * Collection: articles.
 * Per signup year (cohort): distribution of the time between the signup
 * and the last known activity (last connection, or last update of an article
 * they own or which is shared with them), accounts which never came back
 * after their first day, and accounts which came back after 30 days and after a year
 * (among the accounts old enough).
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
    $group: {
      _id: { $year: '$signedUpAt' },
      accounts: { $sum: 1 },
      ...distributionAccumulators('lifespan', '$lifespanDays'),
      oneDayOnly: countIf({ $lt: ['$lifespanHours', 24] }),
      eligibleAfter30Days: countIf({ $gte: ['$ageInDays', 30] }),
      returnedAfter30Days: countIf({
        $and: [{ $gte: ['$ageInDays', 30] }, { $gte: ['$lifespanDays', 30] }],
      }),
      eligibleAfter1Year: countIf({ $gte: ['$ageInDays', 365] }),
      returnedAfter1Year: countIf({
        $and: [{ $gte: ['$ageInDays', 365] }, { $gte: ['$lifespanDays', 365] }],
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
            ...distributionAccumulators('articles', '$articles'),
          },
        },
        { $project: { _id: 0, total: 1, articles: distribution('articles') } },
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
    },
  },
  {
    $project: {
      total: fromSnapshot('snapshot', 'total', 0),
      articles: fromSnapshot('snapshot', 'articles', EMPTY_DISTRIBUTION),
      types: 1,
      years: 1,
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
    },
  },
  {
    $project: {
      total: fromSnapshot('snapshot', 'total', 0),
      distinctMembers: fromSnapshot('distinctMembers', 'count', 0),
      members: fromSnapshot('snapshot', 'members', EMPTY_DISTRIBUTION),
      articles: fromSnapshot('snapshot', 'articles', EMPTY_DISTRIBUTION),
      years: 1,
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
