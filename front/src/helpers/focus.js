const PAGE_START = 'data-page-start'

/**
 * @returns {HTMLElement|null}
 */
function getMain() {
  return document.getElementById('content')
}

/**
 * The focus is considered lost when no element holds it, which happens when
 * the focused element is removed from the DOM (e.g. the link followed during
 * a client-side navigation), or when it sits where a page change put it
 * (main container or page heading), so a page can still move it elsewhere.
 * @returns {boolean}
 */
export function isFocusLost() {
  const active = document.activeElement
  return (
    !active ||
    active === document.body ||
    active === document.documentElement ||
    active === getMain() ||
    active.hasAttribute(PAGE_START)
  )
}

/**
 * After a page change, the focus must move to the new page, except when this
 * page already focused one of its elements (autoFocus field, editor…) or when
 * the navigation was triggered from within the page content (tabs, links that
 * stay in place).
 * @returns {boolean}
 */
export function shouldFocusPageStart() {
  const main = getMain()
  return isFocusLost() || !main?.contains(document.activeElement)
}

/**
 * @param {HTMLElement} main
 * @returns {boolean} whether the heading was found
 */
function focusHeading(main) {
  const heading = main.querySelector('h1')
  if (!heading) {
    return false
  }
  // focusable programmatically only, so it stays out of the tab sequence
  if (!heading.hasAttribute('tabindex')) {
    heading.setAttribute('tabindex', '-1')
  }
  heading.setAttribute(PAGE_START, '')
  heading.focus({ preventScroll: true })
  return true
}

/**
 * Moves the focus to the heading of the page.
 * The heading may not be rendered yet (lazy route, data loading): in that
 * case, the focus goes to the main container, then to the heading as soon as
 * it shows up, unless the focus has been moved in the meantime.
 * @param {object} [options]
 * @param {number} [options.timeout] - how long to wait for the heading (ms)
 * @returns {() => void} stops waiting for the heading
 */
export function focusPageStart({ timeout = 5000 } = {}) {
  const main = getMain()
  if (!main || focusHeading(main)) {
    return () => {}
  }

  main.focus({ preventScroll: true })

  const observer = new MutationObserver(() => {
    if (document.activeElement !== main) {
      stop()
    } else if (focusHeading(main)) {
      stop()
    }
  })
  const timer = setTimeout(() => stop(), timeout)
  function stop() {
    observer.disconnect()
    clearTimeout(timer)
  }
  observer.observe(main, { childList: true, subtree: true })
  return stop
}
