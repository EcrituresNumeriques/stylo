import { useEffect, useState } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button, input, textarea, select, summary, [contenteditable="true"], [tabindex]'
const SAVED_TABINDEX = 'data-focus-zone-tabindex'

/**
 * Focusable descendants of the zone, except those inside a dialog:
 * modals are rendered inside the zone but must keep their own navigation.
 * @param {HTMLElement} zone
 * @returns {HTMLElement[]}
 */
function findInnerFocusables(zone) {
  return Array.from(zone.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) => {
      const dialog = element.closest('dialog')
      return !dialog || !zone.contains(dialog)
    }
  )
}

/**
 * Removes the inner elements from the tab sequence.
 * @param {HTMLElement} zone
 */
function lock(zone) {
  for (const element of findInnerFocusables(zone)) {
    if (!element.hasAttribute(SAVED_TABINDEX)) {
      element.setAttribute(
        SAVED_TABINDEX,
        element.getAttribute('tabindex') ?? ''
      )
      element.setAttribute('tabindex', '-1')
    }
  }
}

/**
 * Puts the inner elements back in the tab sequence.
 * @param {HTMLElement} zone
 */
function unlock(zone) {
  for (const element of zone.querySelectorAll(`[${SAVED_TABINDEX}]`)) {
    const tabindex = element.getAttribute(SAVED_TABINDEX)
    element.removeAttribute(SAVED_TABINDEX)
    if (tabindex === '') {
      element.removeAttribute('tabindex')
    } else {
      element.setAttribute('tabindex', tabindex)
    }
  }
}

/**
 * @param {HTMLElement} element
 * @returns {boolean}
 */
function isUsable(element) {
  return (
    !element.disabled &&
    !element.closest('[hidden], [inert]') &&
    element.getAttribute('tabindex') !== '-1'
  )
}

/**
 * Turns an element into a "focus zone": the zone is a single stop in the tab sequence,
 * <kbd>Enter</kbd> moves the focus to its content (which then becomes reachable with <kbd>Tab</kbd>),
 * and <kbd>Escape</kbd> brings the focus back to the zone.
 * Leaving the zone removes its content from the tab sequence again.
 *
 * The element using the returned ref must have `tabIndex={0}`.
 *
 * @returns {(element: HTMLElement|null) => void} callback ref to set on the zone
 */
export default function useFocusZone() {
  // the zone may be rendered after the component (once data is loaded…)
  const [zone, setZone] = useState(null)

  useEffect(() => {
    if (!zone) {
      return
    }

    let active = false
    const activate = () => {
      active = true
      unlock(zone)
    }
    const deactivate = () => {
      active = false
      lock(zone)
    }

    const handleFocusIn = (event) => {
      if (event.target === zone) {
        deactivate()
      } else if (!active) {
        // the content got focused by other means (mouse click, screen reader…)
        activate()
      }
    }

    const handleFocusOut = (event) => {
      if (!zone.contains(event.relatedTarget)) {
        deactivate()
      }
    }

    const handleKeyDown = (event) => {
      if (event.defaultPrevented) {
        return
      }
      if (event.key === 'Enter' && event.target === zone) {
        event.preventDefault()
        activate()
        findInnerFocusables(zone).find(isUsable)?.focus()
      } else if (
        event.key === 'Escape' &&
        event.target !== zone &&
        !event.target.closest('dialog') &&
        // let an open menu (dropdown…) handle the key first
        !zone.querySelector('[aria-expanded="true"]')
      ) {
        event.preventDefault()
        zone.focus()
      }
    }

    // content can be rendered after the zone (data loading, menus…)
    const observer = new MutationObserver(() => {
      if (!active) {
        lock(zone)
      }
    })
    observer.observe(zone, { childList: true, subtree: true })

    zone.addEventListener('focusin', handleFocusIn)
    zone.addEventListener('focusout', handleFocusOut)
    zone.addEventListener('keydown', handleKeyDown)
    if (
      zone.contains(document.activeElement) &&
      zone !== document.activeElement
    ) {
      activate()
    } else {
      deactivate()
    }

    return () => {
      observer.disconnect()
      zone.removeEventListener('focusin', handleFocusIn)
      zone.removeEventListener('focusout', handleFocusOut)
      zone.removeEventListener('keydown', handleKeyDown)
      unlock(zone)
    }
  }, [zone])

  return setZone
}
