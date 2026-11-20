const {
  count,
  fieldOfFacet,
  fromSnapshot,
  isNonEmptyString,
  snapshotFacet,
} = require('./expressions.js')

const AUTHENTICATION_METHODS = ['password', 'humanid', 'zotero', 'hypothesis']

const AUTHENTICATION = [
  ...AUTHENTICATION_METHODS.map((method) => count(method, `$${method}`)),
  count('multiple', {
    $gt: [
      { $add: AUTHENTICATION_METHODS.map((m) => ({ $toInt: `$${m}` })) },
      1,
    ],
  }),
]
const SNAPSHOT = [count('total'), ...AUTHENTICATION]

/**
 * Collection: users.
 * Users by authentication method (available on the account, not the one used to log in),
 * and created accounts per year.
 */
module.exports = [
  {
    $project: {
      createdAt: 1,
      password: isNonEmptyString('$password'),
      humanid: {
        $or: [
          isNonEmptyString('$authProviders.humanid.id'),
          isNonEmptyString('$authProviders.humanid.email'),
        ],
      },
      zotero: isNonEmptyString('$authProviders.zotero.id'),
      hypothesis: isNonEmptyString('$authProviders.hypothesis.id'),
    },
  },
  {
    $facet: {
      snapshot: snapshotFacet(SNAPSHOT),
      years: [
        { $match: { createdAt: { $type: 'date' } } },
        { $group: { _id: { $year: '$createdAt' }, created: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, year: '$_id', created: 1 } },
      ],
    },
  },
  {
    $project: {
      total: fieldOfFacet('snapshot', 'total', 0),
      authentication: fromSnapshot('snapshot', AUTHENTICATION),
      years: 1,
    },
  },
]
