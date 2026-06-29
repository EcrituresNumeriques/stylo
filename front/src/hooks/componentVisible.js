import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

/**
 * @see https://zellwk.com/blog/keyboard-focusable-elements/
 * @param {HTMLElement} node
 * @returns {T[]}
 */
function findToggleableElements(node) {
  return Array.from(
    node.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    )
  )
}

export default function useComponentVisible({
  initialVisible = false,
  namespace = 'default',
  ref: baseRef,
  track = [],
  trapNavigation = true,
} = {}) {
  const [isComponentVisible, setIsComponentVisible] = useState(initialVisible)
  const uniqueId = useId()
  const selfRef = useRef(null)
  const clickOutsideRefs = [baseRef, selfRef, ...track].filter(
    (d) => d?.current
  )
  const rotorRef = baseRef ?? selfRef

  const handleClickOutside = useCallback(
    (event) => {
      if (!isComponentVisible) {
        return
      }

      const hasClickedOutside =
        clickOutsideRefs.some((r) => r.current.contains(event.target)) === false

      if (
        (clickOutsideRefs.length && hasClickedOutside) ||
        (event.target.nodeName === 'A' && event.target.getAttribute('href'))
      ) {
        setIsComponentVisible(false)
      }
    },
    [isComponentVisible, clickOutsideRefs]
  )

  const handleEscapeKey = useCallback(
    function componenteVisibleHandleEscapeKey(event) {
      if (event.key === 'Escape') {
        setIsComponentVisible(false)
        const first = findToggleableElements(rotorRef.current).at(0)
        first?.focus()
      }
    },
    [rotorRef]
  )

  /*
   * It is acceptable not to have rotorRef otherwise unregistering the event does not work
   * (therefore, it blocks shift+tab navigation when menu is closed)
   */
  const handleTabulation = useCallback(
    function componenteVisibleTabulationRotor(event) {
      if (event.key === 'Tab') {
        const all = findToggleableElements(rotorRef.current)
        const index = all.indexOf(event.target)

        // out of range, we rotate back
        if (!event.shiftKey && index + 1 === all.length) {
          event.preventDefault()
          all.at(0).focus()
        }
        // we rewinded back to beginning, we resume from the end
        else if (event.shiftKey && index - 1 < 0) {
          event.preventDefault()
          all.at(-1).focus()
        } else if (event.shiftKey) {
          all.at(index - 1).focus()
        }
      }
    },
    [rotorRef]
  )

  // uninstall on keyup if element was inside ref.current[aria-controls]

  const toggleComponentIsVisible = useCallback(() => {
    setIsComponentVisible(!isComponentVisible)
  }, [isComponentVisible])

  const uninstallListeners = useCallback(() => {
    document.removeEventListener('click', handleClickOutside, true)
    document.removeEventListener('keyup', handleEscapeKey)
    trapNavigation && document.removeEventListener('keydown', handleTabulation)
  }, [rotorRef])

  useEffect(() => {
    if (isComponentVisible) {
      document.addEventListener('click', handleClickOutside, true)
      document.addEventListener('keyup', handleEscapeKey)
      trapNavigation && document.addEventListener('keydown', handleTabulation)
    } else {
      uninstallListeners()
    }
  }, [isComponentVisible, uniqueId])

  return {
    id: uniqueId,
    isComponentVisible,
    ref: baseRef ?? selfRef,
    setIsComponentVisible,
    toggleComponentIsVisible,
  }
}
