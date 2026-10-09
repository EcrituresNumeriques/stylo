import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

describe('createReduxStore', () => {
  // le module lit le localStorage au chargement : on le réévalue à chaque test
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('it should not keep the previous user session and workspace after logout', async () => {
    // état persisté par l'utilisateur précédent au chargement de la page
    localStorage.setItem('sessionToken', 'previous-user-token')
    localStorage.setItem(
      'userPreferences',
      JSON.stringify({ trackingConsent: true, workspaceId: 'workspace-1' })
    )
    const { default: createReduxStore } = await import('./createReduxStore.js')
    const store = createReduxStore()
    expect(store.getState().userPreferences.workspaceId).toBe('workspace-1')

    store.dispatch({ type: 'LOGOUT' })

    const state = store.getState()
    expect(state.sessionToken).toBeNull()
    expect(state.userPreferences.workspaceId).toBeNull()
    expect(localStorage.getItem('sessionToken')).toBeNull()
    expect(localStorage.getItem('userPreferences')).toBeNull()
  })

  test('it should keep export preferences after logout', async () => {
    const { default: createReduxStore } = await import('./createReduxStore.js')
    const store = createReduxStore()
    store.dispatch({
      type: 'SET_EXPORT_PREFERENCES',
      key: 'formats',
      value: 'pdf',
    })

    store.dispatch({ type: 'LOGOUT' })

    expect(store.getState().exportPreferences.formats).toBe('pdf')
  })
})
