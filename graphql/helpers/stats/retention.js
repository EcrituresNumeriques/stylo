const {
  accumulatorsOf,
  count,
  distributionOf,
  fromSnapshot,
  snapshotFacet,
  unionWithUsers,
} = require('./expressions.js')

const ONE_DAY_IN_HOURS = 24

const returnedAfter = (days) => ({
  $and: [{ $gte: ['$ageInDays', days] }, { $gte: ['$lifespanDays', days] }],
})

const LIFESPAN = distributionOf('lifespanDays', '$lifespanDays')

const COHORT = [
  count('accounts'),
  LIFESPAN,
  count('oneDayOnly', { $lt: ['$lifespanHours', ONE_DAY_IN_HOURS] }),
  count('eligibleAfter30Days', { $gte: ['$ageInDays', 30] }),
  count('returnedAfter30Days', returnedAfter(30)),
  count('eligibleAfter1Year', { $gte: ['$ageInDays', 365] }),
  count('returnedAfter1Year', returnedAfter(365)),
]

const OVERALL = [count('accounts'), LIFESPAN]

/**
 * Collection: articles.
 * Per signup year (cohort): distribution of the time between the signup
 * and the last known activity (last connection, or last update of an article
 * they own or which is shared with them), accounts which never came back
 * after their first day, and accounts which came back after 30 days and after a year
 * (among the accounts old enough); and the same distribution over all the accounts
 * used after their first day.
 */
module.exports = [
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
  unionWithUsers({ who: '$_id', at: '$connectedAt', signedUpAt: '$createdAt' }),
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
  { $set: { lifespanDays: { $divide: ['$lifespanHours', ONE_DAY_IN_HOURS] } } },
  {
    $facet: {
      cohorts: [
        {
          $group: { _id: { $year: '$signedUpAt' }, ...accumulatorsOf(COHORT) },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            year: '$_id',
            accounts: '$accounts',
            lifespanDays: LIFESPAN.output,
            oneDayOnly: '$oneDayOnly',
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
      allAccounts: [
        { $match: { lifespanHours: { $gte: ONE_DAY_IN_HOURS } } },
        ...snapshotFacet(OVERALL),
      ],
    },
  },
  { $project: { cohorts: 1, overall: fromSnapshot('allAccounts', OVERALL) } },
]
