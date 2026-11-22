const { isArticleRoomUrl, canJoinArticleRoom } = require('./collaboration.js')
const Article = require('../models/article.js')
const User = require('../models/user.js')
const Workspace = require('../models/workspace.js')

const jwt = require('jsonwebtoken')
const { ObjectId } = require('mongoose').Types
const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

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

describe('canJoinArticleRoom', () => {
  const jwtSecret = 'test-secret'
  let container
  let owner, contributor, member, stranger, article

  const roomUrl = (articleId, payload, secret = jwtSecret) =>
    `/ws/${articleId}?token=${jwt.sign(payload, secret)}`

  before(async () => {
    container = await setup()
    owner = await User.create({ email: 'ws-owner@huma-num.fr' })
    contributor = await User.create({ email: 'ws-contributor@huma-num.fr' })
    member = await User.create({ email: 'ws-member@huma-num.fr' })
    stranger = await User.create({ email: 'ws-stranger@huma-num.fr' })
    article = await Article.create({
      title: 'Collaborative article',
      owner: owner._id,
      contributors: [{ user: contributor._id, roles: ['write'] }],
    })
    await Workspace.create({
      name: 'Workspace',
      color: '#bb69c9',
      members: [{ user: member._id }],
      articles: [article._id],
      creator: member._id,
    })
  })

  after(async () => {
    await teardown(container)
  })

  test('accepts the owner, a contributor and a workspace member', async () => {
    for (const user of [owner, contributor, member]) {
      assert.equal(
        await canJoinArticleRoom(roomUrl(article.id, { _id: user.id }), {
          jwtSecret,
        }),
        true,
        user.email
      )
    }
  })

  test('accepts an admin token', async () => {
    assert.equal(
      await canJoinArticleRoom(roomUrl(article.id, { admin: true }), {
        jwtSecret,
      }),
      true
    )
  })

  test('rejects a user without access to the article', async () => {
    assert.equal(
      await canJoinArticleRoom(roomUrl(article.id, { _id: stranger.id }), {
        jwtSecret,
      }),
      false
    )
  })

  test('rejects a missing, invalid or incomplete token', async () => {
    const options = { jwtSecret }
    assert.equal(await canJoinArticleRoom(`/ws/${article.id}`, options), false)
    assert.equal(
      await canJoinArticleRoom(`/ws/${article.id}?token=invalid`, options),
      false
    )
    assert.equal(
      await canJoinArticleRoom(
        roomUrl(article.id, { _id: owner.id }, 'another-secret'),
        options
      ),
      false
    )
    assert.equal(
      await canJoinArticleRoom(roomUrl(article.id, { session: true }), options),
      false
    )
  })

  test('rejects an unknown article', async () => {
    const unknownId = new ObjectId().toString()
    for (const payload of [{ _id: owner.id }, { admin: true }]) {
      assert.equal(
        await canJoinArticleRoom(roomUrl(unknownId, payload), { jwtSecret }),
        false
      )
    }
  })
})
