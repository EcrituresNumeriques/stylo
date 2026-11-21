const jwt = require('jsonwebtoken')
const { authorizeUpgrade } = require('./websocket-auth.js')
const User = require('../models/user.js')
const Article = require('../models/article.js')
const Workspace = require('../models/workspace.js')

const { after, before, beforeEach, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

const jwtSecret = 'test-secret'

function createRequest(roomName, token) {
  const query = token ? `?token=${encodeURIComponent(token)}` : ''
  return { url: `/${roomName}${query}` }
}

function signToken(payload) {
  return jwt.sign(payload, jwtSecret)
}

describe('authorizeUpgrade', () => {
  let container

  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Article.deleteMany({}),
      Workspace.deleteMany({}),
    ])
  })

  test('denies a connection without a token', async () => {
    const authorized = await authorizeUpgrade(
      createRequest('ws/articleId'),
      jwtSecret
    )
    assert.strictEqual(authorized, false)
  })

  test('denies a connection with an invalid token', async () => {
    const authorized = await authorizeUpgrade(
      createRequest('ws/articleId', 'not-a-valid-jwt'),
      jwtSecret
    )
    assert.strictEqual(authorized, false)
  })

  test('denies a connection to an article the user has no access to', async () => {
    const user = await User.create({ email: 'user@example.com' })
    const owner = await User.create({ email: 'owner@example.com' })
    const article = await Article.create({ owner: owner._id })
    const token = signToken({ email: user.email, _id: user._id.toString() })

    const authorized = await authorizeUpgrade(
      createRequest(`ws/${article._id}`, token),
      jwtSecret
    )
    assert.strictEqual(authorized, false)
  })

  test('authorizes the owner of the article', async () => {
    const user = await User.create({ email: 'user@example.com' })
    const article = await Article.create({ owner: user._id })
    const token = signToken({ email: user.email, _id: user._id.toString() })

    const authorized = await authorizeUpgrade(
      createRequest(`ws/${article._id}`, token),
      jwtSecret
    )
    assert.strictEqual(authorized, true)
  })

  test('authorizes a member of a workspace containing the article', async () => {
    const user = await User.create({ email: 'user@example.com' })
    const owner = await User.create({ email: 'owner@example.com' })
    const article = await Article.create({ owner: owner._id })
    await Workspace.create({
      name: 'Shared workspace',
      color: 'blue',
      members: [{ user: user._id }],
      articles: [article._id],
    })
    const token = signToken({ email: user.email, _id: user._id.toString() })

    const authorized = await authorizeUpgrade(
      createRequest(`ws/${article._id}`, token),
      jwtSecret
    )
    assert.strictEqual(authorized, true)
  })

  test('authorizes an admin token for any article', async () => {
    const owner = await User.create({ email: 'owner@example.com' })
    const article = await Article.create({ owner: owner._id })
    const token = signToken({ admin: true })

    const authorized = await authorizeUpgrade(
      createRequest(`ws/${article._id}`, token),
      jwtSecret
    )
    assert.strictEqual(authorized, true)
  })
})
