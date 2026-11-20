import { useCallback, useEffect, useId, useRef, useState } from 'react'

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
  ref: baseRef,
  track = [],
  trapNavigation = true,
} = {}) {
  const [isComponentVisible, setIsComponentVisible] = useState(initialVisible)
  const uniqueId = useId()
  const selfRef = useRef(null)
  const rotorRef = baseRef ?? selfRef
  // `track` is usually a new array on each render, keep the latest one in a ref
  // so that event handlers stay stable
  const trackRef = useRef(track)
  trackRef.current = track

  const handleClickOutside = useCallback(
    (event) => {
      // refs are resolved when the event occurs, since elements may have been unmounted
      const elements = [baseRef, selfRef, ...trackRef.current]
        .map((r) => r?.current)
        .filter(Boolean)

      const hasClickedOutside = elements.every(
        (element) => !element.contains(event.target)
      )

      if (
        (elements.length && hasClickedOutside) ||
        (event.target.nodeName === 'A' && event.target.getAttribute('href'))
      ) {
        setIsComponentVisible(false)
      }
    },
    [baseRef]
  )

  const handleEscapeKey = useCallback(
    function componentVisibleHandleEscapeKey(event) {
      if (event.key === 'Escape') {
        setIsComponentVisible(false)
        if (rotorRef.current) {
          const first = findToggleableElements(rotorRef.current).at(0)
          first?.focus()
        }
      }
    },
    [rotorRef]
  )

  const handleTabulation = useCallback(
    function componentVisibleTabulationRotor(event) {
      if (event.key === 'Tab' && rotorRef.current) {
        const all = findToggleableElements(rotorRef.current)
        if (all.length === 0) {
          return
        }
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

  const toggleComponentIsVisible = useCallback(() => {
    setIsComponentVisible((visible) => !visible)
  }, [])

  // listeners are only installed while the component is visible,
  // and are always removed when it gets hidden or unmounted
  useEffect(() => {
    if (!isComponentVisible) {
      return
    }
    document.addEventListener('click', handleClickOutside, true)
    document.addEventListener('keyup', handleEscapeKey)
    if (trapNavigation) {
      document.addEventListener('keydown', handleTabulation)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
      document.removeEventListener('keyup', handleEscapeKey)
      document.removeEventListener('keydown', handleTabulation)
    }
  }, [
    isComponentVisible,
    trapNavigation,
    handleClickOutside,
    handleEscapeKey,
    handleTabulation,
  ])

  return {
    id: uniqueId,
    isComponentVisible,
    ref: rotorRef,
    setIsComponentVisible,
    toggleComponentIsVisible,
  }
}
