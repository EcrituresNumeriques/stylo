import { waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { renderWithProviders } from '../../tests/setup.js'
import { useNakalaSearchCollections } from './nakala.js'

function Collections({ humanid = 'abc' }) {
  useNakalaSearchCollections({ scope: 'owner', humanid })
  return null
}

describe('Nakala API', () => {
  test('sends the session token to the Stylo proxy', async () => {
    renderWithProviders(<Collections />, {
      preloadedState: { sessionToken: 'session-token' },
    })

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        '/nakala/search?fq=scope=collection;owner=abc',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer session-token',
          }),
        })
      )
    )
  })

  test('sends no Authorization header without a session token', async () => {
    // another humanid: SWR caches responses by key between tests
    renderWithProviders(<Collections humanid="def" />, {
      preloadedState: { sessionToken: null },
    })

    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(fetch.mock.lastCall[1].headers).not.toHaveProperty('Authorization')
  })
})
