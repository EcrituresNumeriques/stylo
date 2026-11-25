import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

describe('preferences', () => {
  // le module lit le localStorage au chargement : on le réévalue à chaque test
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('it should read stored preferences and fall back on default values', async () => {
    localStorage.setItem(
      'userPreferences',
      JSON.stringify({ workspaceId: 'workspace-1' })
    )
    const { getPreferences } = await import('./preferences.js')

    expect(getPreferences('user')).toEqual({
      trackingConsent: true,
      workspaceId: 'workspace-1',
    })
    expect(getPreferences('export').formats).toBe('html')
  })

  test('it should persist a preference and notify subscribers', async () => {
    const { getPreferences, setPreference, subscribe } = await import(
      './preferences.js'
    )
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)

    setPreference('corpus', 'metadataFormMode', 'raw')

    expect(getPreferences('corpus').metadataFormMode).toBe('raw')
    expect(JSON.parse(localStorage.getItem('corpusPreferences'))).toEqual({
      metadataFormMode: 'raw',
    })
    expect(listener).toHaveBeenCalledOnce()

    unsubscribe()
    setPreference('corpus', 'metadataFormMode', 'basic')
    expect(listener).toHaveBeenCalledOnce()
  })

  test('it should forget account preferences but keep export preferences', async () => {
    const { forgetAccountPreferences, getPreferences, setPreference } =
      await import('./preferences.js')
    setPreference('user', 'workspaceId', 'workspace-1')
    setPreference('export', 'formats', 'pdf')

    forgetAccountPreferences()

    expect(getPreferences('user').workspaceId).toBeNull()
    expect(localStorage.getItem('userPreferences')).toBeNull()
    expect(getPreferences('export').formats).toBe('pdf')
  })
})
