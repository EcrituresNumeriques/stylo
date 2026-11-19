import assert from 'node:assert'

import { describe, test } from 'node:test'
import { diff } from './diff.js'

describe('diff', () => {
  test('return items to delete', () => {
    const { toAdd, toDelete } = diff(['1', '2', '3'], ['2'])
    assert.deepEqual(toAdd, new Set([]))
    assert.deepEqual(toDelete, new Set(['1', '3']))
  })

  test('return items to add and delete', () => {
    const { toAdd, toDelete } = diff(['1', '2', '3'], ['1', '4'])
    assert.deepEqual(toAdd, new Set(['4']))
    assert.deepEqual(toDelete, new Set(['2', '3']))
  })

  test('return empty if both initial and latest are the same', () => {
    const { toAdd, toDelete } = diff(['1', '2', '3'], ['3', '1', '2'])
    assert.deepEqual(toAdd, new Set([]))
    assert.deepEqual(toDelete, new Set([]))
  })
})
