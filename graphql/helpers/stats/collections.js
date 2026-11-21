const {
  ONE_YEAR_AGO,
  accumulatorsOf,
  count,
  distributionOf,
  fieldOfFacet,
  fromSnapshot,
  outputsOf,
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

/**
 * @param {object[]} statistics per creation year, besides the number of created documents
 * @returns {object[]} facet: the statistics per creation year
 */
function perCreationYear(statistics) {
  const yearly = [count('created'), ...statistics]
  return [
    { $match: { createdAt: { $type: 'date' } } },
    { $group: { _id: { $year: '$createdAt' }, ...accumulatorsOf(yearly) } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, year: '$_id', ...outputsOf(yearly) } },
  ]
}

const CORPUS_SIZE = [distributionOf('articles', '$articles')]
const CORPORA = [
  count('total'),
  count('createdLastTwelveMonths', { $gte: ['$createdAt', ONE_YEAR_AGO] }),
  ...CORPUS_SIZE,
]

/**
 * Collection: corpus.
 * Corpora by type, distribution of their number of articles,
 * per creation year: created corpora and their (current) number of articles,
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
      years: perCreationYear(CORPUS_SIZE),
      months: monthlyCreations,
    },
  },
  {
    $project: {
      ...fromSnapshot('snapshot', CORPORA),
      types: 1,
      years: 1,
      months: 1,
    },
  },
]

const WORKSPACE_SIZE = [
  distributionOf('members', '$members'),
  distributionOf('articles', '$articles'),
]
const WORKSPACES = [count('total'), ...WORKSPACE_SIZE]

/**
 * Collection: workspaces.
 * Distinct members, distribution of the number of members and of articles,
 * per creation year: created workspaces with their (current) members and articles,
 * and per month: created workspaces and their running total.
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
      snapshot: snapshotFacet(WORKSPACES),
      distinctMembers: [
        { $unwind: '$memberIds' },
        { $group: { _id: '$memberIds' } },
        { $count: 'count' },
      ],
      years: perCreationYear(WORKSPACE_SIZE),
      months: monthlyCreations,
    },
  },
  {
    $project: {
      ...fromSnapshot('snapshot', WORKSPACES),
      distinctMembers: fieldOfFacet('distinctMembers', 'count', 0),
      years: 1,
      months: 1,
    },
  },
]

module.exports = { corpora, workspaces }
