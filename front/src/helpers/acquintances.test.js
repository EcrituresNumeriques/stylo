import { describe, test, expect } from 'vitest'
import { merge } from './acquintances.js'

describe('merge', () => {
  test('it should deal with acquintances and contributors', () => {
    const result = merge([{ _id: 1 }], [{ user: { _id: 2 }, roles: ['read'] }])

    expect(result).toEqual([{ _id: 1 }, { _id: 2 }])
  })

  test('it should deduplicate users (and keep last found)', () => {
    const result = merge(
      [{ user: { _id: 1 }, roles: ['read'] }],
      [{ _id: 1, email: 'example.test.com' }]
    )

    expect(result).toEqual([{ _id: 1, email: 'example.test.com' }])
  })
})
