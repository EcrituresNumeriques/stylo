import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import { useModal } from './modal.js'

describe('useModal', () => {
  afterEach(() => {
    document.body.removeAttribute('inert')
    document.body.removeAttribute('data-scrolling')
  })

  test('locks the page while the modal is open', () => {
    const { result } = renderHook(() => useModal())
    expect(result.current.bindings.visible).toBe(false)

    act(() => result.current.show())

    expect(result.current.bindings.visible).toBe(true)
    expect(document.body.getAttribute('inert')).toBe('true')
    expect(document.body.getAttribute('data-scrolling')).toBe('false')
  })

  test('unlocks the page when the modal is closed', () => {
    const { result } = renderHook(() => useModal())
    act(() => result.current.show())

    act(() => result.current.close())

    expect(result.current.bindings.visible).toBe(false)
    expect(document.body.hasAttribute('inert')).toBe(false)
    expect(document.body.hasAttribute('data-scrolling')).toBe(false)
  })

  test('unlocks the page when unmounted while the modal is open', () => {
    const { result, unmount } = renderHook(() => useModal())
    act(() => result.current.show())

    unmount()

    expect(document.body.hasAttribute('inert')).toBe(false)
    expect(document.body.hasAttribute('data-scrolling')).toBe(false)
  })

  test('leaves the page locked when unmounted while another modal is open', () => {
    const opened = renderHook(() => useModal())
    const closed = renderHook(() => useModal())
    act(() => opened.result.current.show())

    closed.unmount()

    expect(document.body.getAttribute('inert')).toBe('true')
  })
})
