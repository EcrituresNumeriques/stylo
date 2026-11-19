import { beforeEach, describe, expect, test } from 'vitest'

import { jsonFetcher } from './nakala.js'

describe('jsonFetcher()', () => {
  beforeEach(() => fetch.mockClear())

  test('sends the payload as JSON body of a POST request', async () => {
    const payload = { query: 'stylo', page: 1 }

    await jsonFetcher({ url: '/nakala/search', payload })

    expect(fetch).toHaveBeenCalledWith(
      '/nakala/search',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      })
    )
  })

  test('sends a GET request without body when there is no payload', async () => {
    await jsonFetcher({ url: '/nakala/users/me' })

    const [, options] = fetch.mock.lastCall
    expect(options.method).toBe('GET')
    expect(options).not.toHaveProperty('body')
  })
})
