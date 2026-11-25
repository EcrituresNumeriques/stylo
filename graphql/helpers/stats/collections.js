const {
  ONE_YEAR_AGO,
  count,
  distributionOf,
  fromSnapshot,
  snapshotFacet,
} = require('./expressions.js')

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

const CORPORA = [
  count('total'),
  count('createdLastTwelveMonths', { $gte: ['$createdAt', ONE_YEAR_AGO] }),
  distributionOf('articles', '$articles'),
]

/**
 * Collection: corpus.
 * Corpora by type, distribution of their number of articles,
 * and per month: created corpora and their running total.
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
      snapshot: snapshotFacet(CORPORA),
      types: [
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $project: { _id: 0, type: '$_id', count: 1 } },
      ],
      months: monthlyCreations,
    },
  },
  {
    $project: {
      ...fromSnapshot('snapshot', CORPORA),
      types: 1,
      months: 1,
    },
  },
]

const WORKSPACES = [
  count('total'),
  distributionOf('members', '$members'),
  distributionOf('articles', '$articles'),
]

/**
 * Collection: workspaces.
 * Distribution of the number of members and of articles,
 * and per month: created workspaces and their running total.
 */
const workspaces = [
  {
    $project: {
      createdAt: 1,
      members: { $size: { $ifNull: ['$members', []] } },
      articles: { $size: { $ifNull: ['$articles', []] } },
    },
  },
  {
    $facet: {
      snapshot: snapshotFacet(WORKSPACES),
      months: monthlyCreations,
    },
  },
  {
    $project: {
      ...fromSnapshot('snapshot', WORKSPACES),
      months: 1,
    },
  },
]

module.exports = { corpora, workspaces }
