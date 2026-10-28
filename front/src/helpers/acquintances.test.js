import { describe, expect, test } from 'vitest'

import { merge } from './acquintances.js'

describe('merge', () => {
  test('it should deal with acquintances and contributors', () => {
    const result = merge([{ id: 1 }], [{ user: { id: 2 }, roles: ['read'] }])

    expect(result).toEqual([{ id: 1 }, { id: 2 }])
  })

  test('it should deduplicate users (and keep last found)', () => {
    const result = merge(
      [{ user: { id: 1 }, roles: ['read'] }],
      [{ id: 1, email: 'example.test.com' }]
    )

    expect(result).toEqual([{ id: 1, email: 'example.test.com' }])
  })
})
