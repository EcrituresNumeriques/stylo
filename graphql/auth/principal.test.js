const { describe, test } = require('node:test')
const assert = require('node:assert')

const UserModel = require('../models/user.js')
const { principalFromToken } = require('./principal.js')

const userId = '63977de2f83aa77c5f92cb1c'
const user = new UserModel({ _id: userId })
const userToken = { _id: userId, email: 'test@example.com', session: true }
const serviceToken = { admin: true, roles: ['read'], readonly: true }

describe('principalFromToken', () => {
  test('is anonymous without a token', () => {
    assert.deepEqual(principalFromToken(undefined, null), { kind: 'anonymous' })
    assert.deepEqual(principalFromToken({}, null), { kind: 'anonymous' })
  })

  test('is anonymous when the account of the token no longer exists', () => {
    assert.deepEqual(principalFromToken(userToken, null), {
      kind: 'anonymous',
    })
  })

  test('is a user with a session token', () => {
    const principal = principalFromToken(userToken, user)
    assert.equal(principal.kind, 'user')
    assert.equal(principal.userId, userId)
    assert.equal(principal.user, user)
  })

  test('is a service with a service token', () => {
    assert.deepEqual(principalFromToken(serviceToken, null), {
      kind: 'service',
      name: 'legacy',
    })
  })

  test('is a service whatever the other claims of the token are', () => {
    for (const token of [
      { admin: true },
      { admin: true, readonly: false },
      { admin: true, _id: userId },
    ]) {
      assert.equal(principalFromToken(token, user).kind, 'service')
    }
  })

  test('is not a service when the admin claim is not strictly true', () => {
    for (const admin of ['true', 1, {}]) {
      assert.equal(principalFromToken({ admin }, null).kind, 'anonymous')
    }
  })
})
