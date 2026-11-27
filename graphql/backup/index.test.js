const { ObjectId } = require('mongoose').Types
const { requestHandler } = require('./index.js')
const User = require('../models/user.js')
const Article = require('../models/article.js')
const Workspace = require('../models/workspace.js')

const { after, before, beforeEach, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

function createMockResponse() {
  return {
    statusCode: null,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
    set(headers) {
      Object.assign(this.headers, headers)
      return this
    },
    send(body) {
      this.body = body
      return this
    },
  }
}

describe('backup requestHandler', () => {
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

  test('rejects a non-admin userId override, even when it is a MongoDB operator', async () => {
    const user = await User.create({ email: 'user@example.com' })
    const req = {
      user,
      token: { _id: user._id.toString(), admin: false },
      body: { scope: 'mine', userId: { $ne: null } },
    }
    const res = createMockResponse()

    await requestHandler(req, res)

    assert.strictEqual(res.statusCode, 403)
    assert.strictEqual(res.body.error, 'FORBIDDEN')
  })

  test('rejects a backup request for a workspace the user is not a member of', async () => {
    const user = await User.create({ email: 'user@example.com' })
    const owner = await User.create({ email: 'owner@example.com' })
    const article = await Article.create({ owner: owner._id })
    const workspace = await Workspace.create({
      name: 'Someone else workspace',
      color: 'red',
      members: [{ user: owner._id }],
      articles: [article._id],
    })
    const req = {
      user,
      token: { _id: user._id.toString(), admin: false },
      body: { scope: 'workspace', workspaceId: workspace._id.toString() },
    }
    const res = createMockResponse()

    await requestHandler(req, res)

    assert.strictEqual(res.statusCode, 404)
    assert.strictEqual(res.body.error, 'NOT_FOUND')
  })

  test('returns a backup for a workspace the user is a member of', async () => {
    const user = await User.create({ email: 'user@example.com' })
    const article = await Article.create({ owner: user._id })
    const workspace = await Workspace.create({
      name: 'My workspace',
      color: 'red',
      members: [{ user: user._id }],
      articles: [article._id],
    })
    const req = {
      user,
      token: { _id: user._id.toString(), admin: false },
      body: { scope: 'workspace', workspaceId: workspace._id.toString() },
    }
    const res = createMockResponse()

    await requestHandler(req, res)

    assert.strictEqual(res.statusCode, 200)
    const backup = JSON.parse(res.body)
    assert.strictEqual(backup.length, 1)
    assert.strictEqual(backup[0].id, article._id.toString())
  })

  test('rejects an unknown workspace with a non-existent id for an admin too', async () => {
    const admin = await User.create({ email: 'admin@example.com' })
    const req = {
      user: admin,
      token: { _id: admin._id.toString(), admin: true },
      body: { scope: 'workspace', workspaceId: new ObjectId().toString() },
    }
    const res = createMockResponse()

    await requestHandler(req, res)

    assert.strictEqual(res.statusCode, 404)
  })
})
