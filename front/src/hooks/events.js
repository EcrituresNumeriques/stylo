/**
 *
 * @param {string[]} keys
 * @param {() => void} fn
 * @returns {() => void}
 */
export function useKeyPress(keys, fn) {
  return function onKeyPress(event) {
    if (keys.includes(event.code) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
      fn()
    }
  }
}
