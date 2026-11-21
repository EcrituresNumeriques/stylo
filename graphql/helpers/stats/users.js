const {
  count,
  fieldOfFacet,
  fromSnapshot,
  isNonEmptyString,
  snapshotFacet,
  yearlyCounts,
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
 * and per year: created accounts, deleted accounts, last connection.
 */
module.exports = [
  {
    $project: {
      createdAt: 1,
      deletedAt: 1,
      connectedAt: 1,
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
      years: yearlyCounts(
        [
          { year: { $year: '$createdAt' }, kind: 'created' },
          { year: { $year: '$deletedAt' }, kind: 'deleted' },
          { year: { $year: '$connectedAt' }, kind: 'lastConnected' },
        ],
        ['created', 'deleted', 'lastConnected']
      ),
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
