const { onSuccess } = require('./local.js')
const User = require('../models/user.js')
const config = require('../config.js')

const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

describe('local authentication', () => {
  let container
  before(async () => {
    container = await setup()
    config.set('security.jwt.secret', 'test-secret')
  })

  after(async () => {
    await teardown(container)
  })

  test('only returns the public profile of the user', async () => {
    const user = await User.create({
      email: 'local-login@huma-num.fr',
      username: 'local-login',
      password: 'p4ssw0rd',
      authProviders: { zotero: { id: 'zotero-id', token: 'zotero-token' } },
    })
    const res = {
      json(body) {
        this.body = body
      },
    }

    await onSuccess({ user }, res)

    assert.equal(res.statusCode, 200)
    assert.ok(res.body.token)
    assert.equal(res.body.user.id, user.id)
    assert.equal(res.body.user.username, 'local-login')
    assert.equal(res.body.user._id, undefined)
    assert.equal(res.body.user.password, undefined)
    assert.equal(res.body.user.authProviders, undefined)
  })

  test('records a local access', async () => {
    const user = await User.create({ email: 'local-access@huma-num.fr' })
    const res = { json() {} }

    await onSuccess({ user, ip: '192.168.1.42' }, res)

    const { lastAccesses } = await User.findById(user.id)
    assert.equal(lastAccesses.length, 1)
    assert.equal(lastAccesses[0].strategy, 'local')
    assert.equal(lastAccesses[0].ip, '192.168.1.0')
  })
})
