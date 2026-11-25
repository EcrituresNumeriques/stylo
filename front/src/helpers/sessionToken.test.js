import { describe, expect, test } from 'vitest'

import { executeQuery } from './graphQL.js'
import {
  getSessionToken,
  removeSessionToken,
  setSessionToken,
} from './sessionToken.js'

describe('sessionToken', () => {
  test('it should send the stored session token with GraphQL requests', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    })
    setSessionToken('user-token')
    expect(getSessionToken()).toBe('user-token')

    await executeQuery({ query: '{ user { id } }' })

    expect(fetch.mock.lastCall[1].headers.Authorization).toBe(
      'Bearer user-token'
    )
  })

  test('it should not authenticate requests once the session token is removed', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    })
    setSessionToken('user-token')
    removeSessionToken()
    expect(getSessionToken()).toBeNull()

    await executeQuery({ query: '{ user { id } }' })

    expect(fetch.mock.lastCall[1].headers).not.toHaveProperty('Authorization')
  })
})
