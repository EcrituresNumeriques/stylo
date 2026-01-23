import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * @see https://zellwk.com/blog/keyboard-focusable-elements/
 * @param {HTMLElement} node
 * @returns {HTMLElement}
 */
function findToggleableElements(node) {
  return Array.from(
    node.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    )
  )
}

export default function useComponentVisible(
  initialIsVisible,
  name = 'default'
) {
  const [isComponentVisible, setIsComponentVisible] = useState(initialIsVisible)
  const ref = useRef(null)

  const handleClickOutside = useCallback((event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsComponentVisible(false)
    }
  }, [])

  const handleEscapeKey = useCallback(function componenteVisibleHandleEscapeKey(
    event
  ) {
    if (event.key === 'Escape') {
      setIsComponentVisible(false)
      const first = findToggleableElements(ref.current).at(0)
      first?.focus()
    }
  }, [])

  const handleTabulation = useCallback(
    function componenteVisibleTabulationRotor(event) {
      if (event.key === 'Tab') {
        // const relatedMenu =
        const all = findToggleableElements(ref.current)
        const index = all.findIndex((el) => el === event.target)

        // out of range, we rotate back
        if (!event.shiftKey && index + 1 === all.length) {
          event.preventDefault()
          all.at(0).focus()
        }
        // we rewinded back to beginning, we resume from the end
        else if (event.shiftKey && index - 1 < 0) {
          event.preventDefault()
          all.at(-1).focus()
        }
      }
    },
    []
  )

  // uninstall on keyup if element was inside ref.current[aria-controls]

  const toggleComponentIsVisible = useCallback(() => {
    setIsComponentVisible(!isComponentVisible)
  }, [isComponentVisible])

  const uninstallListeners = useCallback(() => {
    document.removeEventListener('click', handleClickOutside, true)
    document.removeEventListener('keyup', handleEscapeKey)
    document.removeEventListener('keydown', handleTabulation)
  }, [])

  useEffect(() => {
    if (isComponentVisible) {
      document.addEventListener('click', handleClickOutside, true)
      document.addEventListener('keyup', handleEscapeKey)
      document.addEventListener('keydown', handleTabulation)
    } else {
      uninstallListeners()
    }
  }, [isComponentVisible])

  return {
    ref,
    isComponentVisible,
    setIsComponentVisible,
    toggleComponentIsVisible,
  }
}
