const { isArticleRoomUrl } = require('./collaboration.js')

const { describe, test } = require('node:test')
const assert = require('node:assert')

describe('isArticleRoomUrl', () => {
  test('accepts the room of an article', () => {
    assert.equal(isArticleRoomUrl('/ws/6afb023e23970475e33bd7c1'), true)
    assert.equal(isArticleRoomUrl('/ws/6afb023e23970475e33bd7c1?x=1'), true)
  })

  test('rejects an invalid article id', () => {
    assert.equal(isArticleRoomUrl('/ws/undefined'), false)
    assert.equal(isArticleRoomUrl('/ws/6afb023e'), false)
    assert.equal(isArticleRoomUrl('/ws/6afb023e23970475e33bd7c1/extra'), false)
  })

  test('rejects other paths', () => {
    assert.equal(isArticleRoomUrl('/'), false)
    assert.equal(isArticleRoomUrl('/graphql'), false)
    assert.equal(isArticleRoomUrl(undefined), false)
  })
})
