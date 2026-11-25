const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const jwt = require('jsonwebtoken')

const User = require('../models/user.js')
const { populateUserFromJWT } = require('./token.js')
const { setup, teardown } = require('../tests/harness.js')

const jwtSecret = 'test-secret'

describe('populateUserFromJWT', () => {
  let container
  let alice
  let bob
  const middleware = populateUserFromJWT({ jwtSecret })

  before(async () => {
    container = await setup()
    alice = await User.create({ email: 'alice@example.com' })
    bob = await User.create({ email: 'bob@example.com' })
  })

  after(async () => {
    await teardown(container)
  })

  async function run(req) {
    await middleware(req, {}, () => {})
    return req
  }

  function bearer(payload, secret = jwtSecret) {
    return { authorization: `Bearer ${jwt.sign(payload, secret)}` }
  }

  test('loads the user of the token', async () => {
    const req = await run({ headers: bearer({ _id: alice.id }) })
    assert.equal(req.user.id, alice.id)
    assert.equal(req.token._id, alice.id)
  })

  test('ignores the user restored from the session cookie without token', async () => {
    const req = await run({ headers: {}, user: alice })
    assert.equal(req.user, null)
  })

  test('uses the user of the token rather than the user of the session', async () => {
    const req = await run({ headers: bearer({ _id: bob.id }), user: alice })
    assert.equal(req.user.id, bob.id)
  })

  test('ignores an invalid token', async () => {
    const req = await run({
      headers: bearer({ _id: alice.id }, 'another-secret'),
      user: alice,
    })
    assert.equal(req.user, null)
    assert.equal(req.token, undefined)
  })
})
