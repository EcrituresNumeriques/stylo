const {
  accumulatorsOf,
  bands,
  count,
  firstOf,
  outputsOf,
  fromSnapshot,
  snapshotFacet,
  unionWithUsers,
  EXAMPLE_ARTICLE_DELAY_IN_MS,
  ONE_MINUTE_IN_MS,
  ONE_YEAR_AGO,
} = require('./expressions.js')

const ONE_WEEK_IN_DAYS = 7

// [band, from (included), to (excluded)], in calendar years since the signup
const SENIORITY = [
  ['sameYear', null, 1],
  ['oneToTwoYears', 1, 3],
  ['threeToFiveYears', 3, 6],
  ['moreThanFiveYears', 6, null],
]

/**
 * What each person did, as `{ who, at, kind }`: from the articles
 * (created, with their last update, updated, shared), the workspaces
 * (an article created in one of theirs), plus their current workspace memberships
 * and their signup.
 */
const events = [
  {
    $project: {
      _id: 0,
      events: {
        $concatArrays: [
          [
            {
              who: '$owner',
              at: '$createdAt',
              updatedAt: '$updatedAt',
              kind: 'created',
            },
          ],
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
  // one document per member and article of each workspace (a single one without articles):
  // starts from the (few) workspaces, and fetches the article dates by _id.
  // The membership is not dated: every member counts as a current member.
  {
    $unionWith: {
      coll: 'workspaces',
      pipeline: [
        { $project: { members: '$members.user', articles: 1 } },
        { $unwind: { path: '$articles', preserveNullAndEmptyArrays: true } },
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
  unionWithUsers({
    who: '$_id',
    signedUpAt: '$createdAt',
    deletedAt: '$deletedAt',
    kind: 'signup',
  }),
  {
    $match: {
      who: { $type: 'objectId' },
      $or: [
        { at: { $type: 'date' } },
        { kind: { $in: ['workspace', 'signup'] } },
      ],
    },
  },
]

/**
 * One document per user: their dated activities that count, their signup date,
 * whether they are a member of a workspace.
 */
const perUser = [
  {
    $group: {
      _id: '$who',
      // the dated events (not the signup, nor a membership without article)
      events: {
        $push: {
          $cond: [
            { $eq: [{ $type: '$at' }, 'date'] },
            { at: '$at', updatedAt: '$updatedAt', kind: '$kind' },
            '$$REMOVE',
          ],
        },
      },
      isMember: { $max: { $eq: ['$kind', 'workspace'] } },
      exists: { $max: { $eq: ['$kind', 'signup'] } },
      signedUpAt: { $max: '$signedUpAt' },
      deletedAt: { $max: '$deletedAt' },
    },
  },
  // ignores the references to users that no longer exist
  { $match: { exists: true } },
  {
    $set: {
      oneWeekAfterSignup: {
        $dateAdd: {
          startDate: '$signedUpAt',
          unit: 'day',
          amount: ONE_WEEK_IN_DAYS,
        },
      },
    },
  },
  // dates of the activities that count (see below)
  {
    $set: {
      activeAt: {
        $map: {
          input: {
            $filter: {
              input: '$events',
              cond: {
                $or: [
                  // shared with them, or in their workspace: from their signup
                  {
                    $and: [
                      { $in: ['$$this.kind', ['shared', 'workspace']] },
                      { $gte: ['$$this.at', '$signedUpAt'] },
                    ],
                  },
                  // their own articles: from one week after their signup
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
]

const YEARLY = [
  count('activeUsers'),
  count('inWorkspace', '$isMember'),
  bands('seniority', '$seniority', SENIORITY),
]

const anyOf = (input, condition) => ({
  $anyElementTrue: [{ $map: { input, in: condition } }],
})

const LAST_TWELVE_MONTHS = [count('activeUsers', '$last')]

const isExampleArticle = (event) => ({
  $and: [
    { $eq: [`${event}.kind`, 'created'] },
    {
      $lte: [
        { $abs: { $subtract: [`${event}.at`, '$signedUpAt'] } },
        EXAMPLE_ARTICLE_DELAY_IN_MS,
      ],
    },
  ],
})

/**
 * Engagement of an account, null for a deleted account or one less than a week old:
 * - ongoing: active after their first week, and over the last 12 months;
 * - lapsed: active after their first week, but not over the last 12 months;
 * - tried: did something during their first week only: modified or deleted
 *   their example article, created another article, or contributed to one,
 *   or was a member of a workspace in which an article was created;
 * - idle: did nothing.
 * The activities are the ones of the active users (see below): a connection is not one.
 */
const engagement = {
  $let: {
    vars: {
      afterFirstWeek: {
        $filter: {
          input: '$activeAt',
          cond: { $gte: ['$$this', '$oneWeekAfterSignup'] },
        },
      },
      examples: {
        $filter: { input: '$events', cond: isExampleArticle('$$this') },
      },
    },
    // the first category whose condition holds
    in: firstOf(
      [
        [
          {
            $or: [
              { $eq: [{ $type: '$deletedAt' }, 'date'] },
              { $gt: ['$oneWeekAfterSignup', '$$NOW'] },
            ],
          },
          null,
        ],
        [
          anyOf('$$afterFirstWeek', { $gte: ['$$this', ONE_YEAR_AGO] }),
          'ongoing',
        ],
        [{ $gt: [{ $size: '$$afterFirstWeek' }, 0] }, 'lapsed'],
        [
          {
            $or: [
              { $gt: [{ $size: '$activeAt' }, 0] },
              { $eq: [{ $size: '$$examples' }, 0] },
              anyOf('$$examples', {
                $gt: [
                  { $subtract: ['$$this.updatedAt', '$$this.at'] },
                  ONE_MINUTE_IN_MS,
                ],
              }),
              anyOf('$events', {
                $and: [
                  { $eq: ['$$this.kind', 'created'] },
                  { $not: [isExampleArticle('$$this')] },
                ],
              }),
            ],
          },
          'tried',
        ],
      ],
      'idle'
    ),
  },
}

const ENGAGEMENT = ['idle', 'tried', 'lapsed', 'ongoing'].map((name) =>
  count(name, { $eq: ['$engagement', name] })
)

const withEngagement = { $match: { engagement: { $type: 'string' } } }

/**
 * Collection: articles.
 * Active users per year. A user is active a given year when, that year:
 * - they created an article, at least one week after their signup;
 * - an article they own or which is shared with them was last updated,
 *   at least one week after their signup (the writer is not recorded);
 * - they are a contributor of an article created that year;
 * - they are a member of a workspace in which an article was created that year;
 * never before their signup.
 * The week after the signup ignores the default article, created with the account.
 * Versions are not used: automatic versions (signup, editing sessions) make them noisy.
 * Also: the same over the last 12 months;
 * and the accounts by engagement, overall and per signup year.
 */
module.exports = [
  ...events,
  ...perUser,
  {
    $project: {
      years: 1,
      signedUpAt: 1,
      isMember: 1,
      last: anyOf('$activeAt', { $gte: ['$$this', ONE_YEAR_AGO] }),
      engagement,
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
            seniority: { $subtract: ['$year', { $year: '$signedUpAt' }] },
          },
        },
        { $group: { _id: '$year', ...accumulatorsOf(YEARLY) } },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            year: '$_id',
            ...outputsOf(YEARLY),
          },
        },
      ],
      rolling: snapshotFacet(LAST_TWELVE_MONTHS),
      engagementYears: [
        withEngagement,
        {
          $group: {
            _id: { $year: '$signedUpAt' },
            ...accumulatorsOf(ENGAGEMENT),
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, year: '$_id', ...outputsOf(ENGAGEMENT) } },
      ],
      allAccounts: [withEngagement, ...snapshotFacet(ENGAGEMENT)],
    },
  },
  {
    $project: {
      years: 1,
      lastTwelveMonths: fromSnapshot('rolling', LAST_TWELVE_MONTHS),
      engagement: {
        ...fromSnapshot('allAccounts', ENGAGEMENT),
        years: '$engagementYears',
      },
    },
  },
]
