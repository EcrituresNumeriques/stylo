/**
 * Building blocks of the stats pipelines: aggregation expressions,
 * accumulators and stages shared by several pipelines.
 *
 * A "statistic" (`count`, `distributionOf`, `bands`) describes one figure once:
 * its accumulators in a `$group`, its output once grouped, and its value when
 * nothing was grouped (empty collection). `snapshotFacet` and `fromSnapshot`
 * build the stages from a list of statistics, so adding one means adding one entry.
 */

const ONE_MINUTE_IN_MS = 60 * 1000
const ONE_DAY_IN_MS = 24 * 60 * ONE_MINUTE_IN_MS
const ONE_YEAR_AGO = {
  $dateSubtract: { startDate: '$$NOW', unit: 'year', amount: 1 },
}

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
 * Nested `$cond` rather than `$switch`, whose `then` keys make the stages thenable.
 *
 * @param {string} value expression of the value
 * @param {number} depth how deep to look into arrays and objects
 * @returns {object} expression: true when the value holds something
 * (a non-empty string, a number, a boolean, a date, or such a value nested in an array or an object)
 */
function isFilled(value, depth) {
  const variable = `nested${depth}`
  const anyFilled = (input, item) =>
    depth > 0
      ? {
          $anyElementTrue: [
            { $map: { input, as: variable, in: isFilled(item, depth - 1) } },
          ],
        }
      : true
  const type = { $type: value }
  return {
    $cond: [
      // null and missing values first: the most frequent ones
      { $lte: [value, null] },
      false,
      {
        $cond: [
          { $eq: [type, 'string'] },
          { $ne: [value, ''] },
          {
            $cond: [
              { $isArray: value },
              anyFilled(value, `$$${variable}`),
              {
                $cond: [
                  { $eq: [type, 'object'] },
                  anyFilled({ $objectToArray: value }, `$$${variable}.v`),
                  {
                    $in: [
                      type,
                      ['double', 'int', 'long', 'decimal', 'bool', 'date'],
                    ],
                  },
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
 * @param {object} condition
 * @param {string|object} value
 * @returns {object} expression: the value when the condition holds, null otherwise
 * (null values are ignored by `$avg`, `$percentile` and `$max`)
 */
function onlyWhen(condition, value) {
  return { $cond: [condition, value, null] }
}

/**
 * @param {object|boolean} condition
 * @returns {object} accumulator counting the documents matching `condition`
 */
function countIf(condition) {
  return { $sum: condition === true ? 1 : { $cond: [condition, 1, 0] } }
}

/**
 * @param {string|object} value
 * @param {number|null} from included, no lower bound when null
 * @param {number|null} to excluded, no upper bound when null
 * @returns {object} expression: true when the value is a number and `from <= value < to`
 * (no ±Infinity bound, which mongosh cannot paste)
 */
function isBetween(value, from, to) {
  return {
    $and: [
      { $isNumber: value },
      ...(from === null ? [] : [{ $gte: [value, from] }]),
      ...(to === null ? [] : [{ $lt: [value, to] }]),
    ],
  }
}

/**
 * Statistic: number of documents matching a condition.
 *
 * @param {string} name
 * @param {object|boolean} [condition] every document when omitted
 * @returns {object} statistic
 */
function count(name, condition = true) {
  return {
    name,
    accumulators: { [name]: countIf(condition) },
    output: `$${name}`,
    empty: 0,
  }
}

/**
 * Statistic: mean, percentiles (approximate, the only method of MongoDB 7.0)
 * and maximum of a value, rounded to one decimal. Null values are ignored.
 *
 * @param {string} name
 * @param {string|object} input
 * @returns {object} statistic
 */
function distributionOf(name, input) {
  const percentile = (index) => ({
    $round: [{ $arrayElemAt: [`$${name}Percentiles`, index] }, 1],
  })
  return {
    name,
    accumulators: {
      [`${name}Mean`]: { $avg: input },
      [`${name}Percentiles`]: {
        $percentile: { input, p: [0.1, 0.5, 0.9], method: 'approximate' },
      },
      [`${name}Max`]: { $max: input },
    },
    output: {
      mean: { $round: [`$${name}Mean`, 1] },
      p10: percentile(0),
      median: percentile(1),
      p90: percentile(2),
      max: { $round: [`$${name}Max`, 1] },
    },
    empty: EMPTY_DISTRIBUTION,
  }
}

/**
 * Statistic: number of documents per band of a value.
 *
 * @param {string} name
 * @param {string|object} value
 * @param {Array<[string, number|null, number|null]>} bands `[band, from (included), to (excluded)]`
 * @returns {object} statistic: an object with one count per band
 */
function bands(name, value, bandList) {
  const field = (band) => `${name}_${band}`
  return {
    name,
    accumulators: Object.fromEntries(
      bandList.map(([band, from, to]) => [
        field(band),
        countIf(isBetween(value, from, to)),
      ])
    ),
    output: Object.fromEntries(
      bandList.map(([band]) => [band, `$${field(band)}`])
    ),
    empty: Object.fromEntries(bandList.map(([band]) => [band, 0])),
  }
}

/**
 * @param {object[]} statistics
 * @returns {object} the accumulators of the statistics, to spread in a `$group`
 */
function accumulatorsOf(statistics) {
  return Object.assign({}, ...statistics.map((s) => s.accumulators))
}

/**
 * @param {object[]} statistics
 * @returns {object} the outputs of the statistics, to spread in a `$project` following the `$group`
 */
function outputsOf(statistics) {
  return Object.fromEntries(statistics.map((s) => [s.name, s.output]))
}

/**
 * @param {object[]} statistics
 * @returns {object[]} facet computing the statistics over all its documents (a single document)
 */
function snapshotFacet(statistics) {
  return [
    { $group: { _id: null, ...accumulatorsOf(statistics) } },
    { $project: { _id: 0, ...outputsOf(statistics) } },
  ]
}

/**
 * @param {string} facet
 * @param {string} field
 * @param {any} empty value when the facet is empty
 * @returns {object} expression: a field of the single document of a facet
 */
function fieldOfFacet(facet, field, empty) {
  return {
    $ifNull: [
      { $getField: { field, input: { $first: `$${facet}` } } },
      { $literal: empty },
    ],
  }
}

/**
 * The facet must not have the name of an output field: a `$project` of an object
 * on an array field is applied to each of its elements.
 *
 * @param {string} facet name of a `snapshotFacet`
 * @param {object[]} statistics its statistics
 * @returns {object} the statistics read from the facet, to spread in the final `$project`
 */
function fromSnapshot(facet, statistics) {
  return Object.fromEntries(
    statistics.map((s) => [s.name, fieldOfFacet(facet, s.name, s.empty)])
  )
}

/**
 * Stages counting events per year: each document holds `events`,
 * a list of `{ year, kind }` (a missing year is ignored).
 *
 * @param {object} events expression of the list of events
 * @param {string[]} kinds the kinds of event, each becoming a count
 * @returns {object[]} stages returning `{ year, <kind>: count }`, sorted by year
 */
function yearlyCounts(events, kinds) {
  return [
    { $project: { _id: 0, events } },
    { $unwind: '$events' },
    { $match: { 'events.year': { $type: 'number' } } },
    {
      $group: {
        _id: '$events.year',
        ...Object.fromEntries(
          kinds.map((kind) => [kind, countIf({ $eq: ['$events.kind', kind] })])
        ),
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id',
        ...Object.fromEntries(kinds.map((kind) => [kind, 1])),
      },
    },
  ]
}

/**
 * Adds the users to the documents of the pipeline, to join them with a `$group`
 * or a window afterwards: much faster than a `$lookup` per document (about 30 µs each).
 *
 * @param {object} projection fields of each user (from `$_id`, `$createdAt`…)
 * @returns {object} stage
 */
function unionWithUsers(projection) {
  return {
    $unionWith: {
      coll: 'users',
      pipeline: [{ $project: { _id: 0, ...projection } }],
    },
  }
}

module.exports = {
  ONE_MINUTE_IN_MS,
  ONE_DAY_IN_MS,
  ONE_YEAR_AGO,
  EMPTY_DISTRIBUTION,
  isNonEmptyString,
  isNonEmptyArray,
  isFilled,
  isBetween,
  onlyWhen,
  countIf,
  count,
  distributionOf,
  bands,
  accumulatorsOf,
  outputsOf,
  snapshotFacet,
  fieldOfFacet,
  fromSnapshot,
  yearlyCounts,
  unionWithUsers,
}
