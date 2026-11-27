const RELOADED_AT_KEY = 'stylo:preloadErrorReloadedAt'
const RELOAD_LOOP_DELAY_MS = 10_000

/**
 * After a deployment, a tab opened on a previous release may request files
 * (chunks, stylesheets, workers) that no longer exist.
 * Reloads the page to get the new release, unless it has just been reloaded
 * (the file is really missing, reloading again would loop).
 * @returns {boolean} true when the page is being reloaded
 */
export function reloadForMissingFile() {
  try {
    const reloadedAt = Number(sessionStorage.getItem(RELOADED_AT_KEY))
    if (reloadedAt && Date.now() - reloadedAt < RELOAD_LOOP_DELAY_MS) {
      return false
    }
    sessionStorage.setItem(RELOADED_AT_KEY, String(Date.now()))
  } catch {
    // sessionStorage unavailable: we can't prevent a reload loop
    return false
  }
  window.location.reload()
  return true
}

/**
 * A worker that could not be loaded emits an error event without message
 * (file not found) or a syntax error (an HTML page served in place of the script).
 * An error thrown while the worker is running has another message and is left alone.
 * @param {Event|ErrorEvent} event error event of a Worker
 * @returns {boolean}
 */
export function isWorkerLoadError(event) {
  return !event.message || event.message.includes('SyntaxError')
}
