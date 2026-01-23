/**
 * Compares two arrays and returns the differences between them.
 *
 * @param {Array} initial - The initial array to compare from
 * @param {Array} latest - The latest array to compare to
 * @returns {{toDelete: Set<any>, toAdd: Set<any>}} An object containing:
 *   - toDelete: Set of items present in initial but not in latest
 *   - toAdd: Set of items present in latest but not in initial
 *
 * @example
 * // Find differences between two arrays
 * const { toAdd, toDelete } = diff(['1', '2', '3'], ['2', '4']);
 * // toDelete: Set(['1', '3'])
 * // toAdd: Set(['4'])
 *
 * @example
 * // Same arrays return empty sets
 * const { toAdd, toDelete } = diff(['a', 'b'], ['b', 'a']);
 * // toDelete: Set([])
 * // toAdd: Set([])
 */
function diff(initial, latest) {
  const initialSet = new Set(initial)
  const latestSet = new Set(latest)
  const toDelete = initialSet.difference(latestSet)
  const toAdd = latestSet.difference(initialSet)
  return { toDelete, toAdd }
}

module.exports = {
  diff,
}
