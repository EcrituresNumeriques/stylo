const {
  accumulatorsOf,
  bands,
  count,
  outputsOf,
  fromSnapshot,
  snapshotFacet,
  unionWithUsers,
  ONE_YEAR_AGO,
} = require('./expressions.js')

const ONE_WEEK_IN_DAYS = 7
const TWO_YEARS_AGO = {
  $dateSubtract: { startDate: '$$NOW', unit: 'year', amount: 2 },
}

// [band, from (included), to (excluded)], in calendar years since the signup
const SENIORITY = [
  ['sameYear', null, 1],
  ['oneToTwoYears', 1, 3],
  ['threeToFiveYears', 3, 6],
  ['moreThanFiveYears', 6, null],
]

/**
 * What each person did, as `{ who, at, kind }`: from the articles
 * (created, updated, shared), the workspaces (an article created in one of theirs),
 * plus their current workspace memberships and their signup.
 */
const events = [
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
  unionWithUsers({ who: '$_id', signedUpAt: '$createdAt', kind: 'signup' }),
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
            { at: '$at', kind: '$kind' },
            '$$REMOVE',
          ],
        },
      },
      isMember: { $max: { $eq: ['$kind', 'workspace'] } },
      exists: { $max: { $eq: ['$kind', 'signup'] } },
      signedUpAt: { $max: '$signedUpAt' },
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
  count('retainedNextYear', { $in: [{ $add: ['$year', 1] }, '$years'] }),
  count('inWorkspace', '$isMember'),
  bands('seniority', '$seniority', SENIORITY),
]

const activeAtSome = (from, to) => ({
  $anyElementTrue: [
    {
      $map: {
        input: '$activeAt',
        in: {
          $and: [
            { $gte: ['$$this', from] },
            ...(to ? [{ $lt: ['$$this', to] }] : []),
          ],
        },
      },
    },
  ],
})

const LAST_TWELVE_MONTHS = [
  count('activeUsers', '$last'),
  count('previousActiveUsers', '$previous'),
  count('retained', { $and: ['$last', '$previous'] }),
]

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
 * Also: the same over the last 12 months, and the 12 months before.
 */
module.exports = [
  ...events,
  ...perUser,
  {
    $project: {
      years: 1,
      signedUpAt: 1,
      isMember: 1,
      last: activeAtSome(ONE_YEAR_AGO),
      previous: activeAtSome(TWO_YEARS_AGO, ONE_YEAR_AGO),
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
            // the next year is not over (or has not started) yet
            retainedNextYear: {
              $cond: [
                { $gte: ['$_id', { $subtract: [{ $year: '$$NOW' }, 1] }] },
                null,
                '$retainedNextYear',
              ],
            },
          },
        },
      ],
      rolling: snapshotFacet(LAST_TWELVE_MONTHS),
    },
  },
  {
    $project: {
      years: 1,
      lastTwelveMonths: fromSnapshot('rolling', LAST_TWELVE_MONTHS),
    },
  },
]
