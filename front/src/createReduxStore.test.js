import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

describe('createReduxStore', () => {
  // le module lit le localStorage au chargement : on le réévalue à chaque test
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('it should not keep the previous user session after logout', async () => {
    // état persisté par l'utilisateur précédent au chargement de la page
    localStorage.setItem('sessionToken', 'previous-user-token')
    const { default: createReduxStore } = await import('./createReduxStore.js')
    const store = createReduxStore()
    expect(store.getState().sessionToken).toBe('previous-user-token')

    store.dispatch({ type: 'LOGOUT' })

    expect(store.getState().sessionToken).toBeNull()
    expect(localStorage.getItem('sessionToken')).toBeNull()
  })
})
