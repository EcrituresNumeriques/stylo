import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { isWorkerLoadError, reloadForMissingFile } from './staleRelease.js'

describe('reloadForMissingFile', () => {
  const reload = vi.fn()

  beforeEach(() => {
    sessionStorage.clear()
    reload.mockClear()
    vi.stubGlobal('location', { ...window.location, reload })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('reloads the page', () => {
    expect(reloadForMissingFile()).toBe(true)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  test('does not reload again right after a reload', () => {
    reloadForMissingFile()
    vi.advanceTimersByTime(5_000)

    expect(reloadForMissingFile()).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  test('reloads again later', () => {
    reloadForMissingFile()
    vi.advanceTimersByTime(11_000)

    expect(reloadForMissingFile()).toBe(true)
    expect(reload).toHaveBeenCalledTimes(2)
  })

  test('does not reload when sessionStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    expect(reloadForMissingFile()).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  })
})

describe('isWorkerLoadError', () => {
  test('file not found: an event without message', () => {
    expect(isWorkerLoadError(new Event('error'))).toBe(true)
  })

  test('an HTML page served in place of the script', () => {
    expect(
      isWorkerLoadError({
        message: "Uncaught SyntaxError: Unexpected token '<'",
      })
    ).toBe(true)
  })

  test('an error thrown by the running worker', () => {
    expect(
      isWorkerLoadError({ message: 'Uncaught TypeError: x is not a function' })
    ).toBe(false)
  })
})
