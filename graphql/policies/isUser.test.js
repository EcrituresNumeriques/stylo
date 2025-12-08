const isUser = require('./isUser.js')
const UserModel = require('../models/user.js')

const { describe, test } = require('node:test')
const assert = require('node:assert')

const user = '63977de2f83aa77c5f92cb1c'
const sameUserObject = new UserModel({ _id: user })
const sameUserToken = {
  _id: user,
  email: 'test@example.com',
  session: true,
}

const differentUserObject = new UserModel({ _id: '00000de2f83aa77c5f92dc2f' })

const adminToken = { admin: true, roles: ['read'], readonly: true }

describe('isUser', () => {
  test('without token, no args.user', () => {
    assert.throws(() => isUser({}, { token: {} }), { message: /Unauthorized/ })
  })

  test('without token, explicit args.user', () => {
    assert.throws(() => isUser({ user }, { token: {} }), {
      message: /Unauthorized/,
    })
  })

  test('with admin token, explicit args.user', () => {
    assert.deepStrictEqual(isUser({ user }, { token: adminToken }), {
      userId: user,
    })
  })

  test('with admin token, no args.user', () => {
    assert.deepStrictEqual(isUser({}, { token: adminToken }), { userId: null })
  })

  test('with token, implicit user is token user', () => {
    assert.deepStrictEqual(
      isUser({}, { token: sameUserToken, user: sameUserObject }),
      {
        userId: sameUserToken._id,
      }
    )
  })

  test('with token, explicit user is same as user token', () => {
    assert.deepStrictEqual(
      isUser({ user }, { token: sameUserToken, user: sameUserObject }),
      { userId: user }
    )
  })

  test('with token, explicit user is different than user token', () => {
    assert.throws(
      () =>
        isUser(
          { user: differentUserObject.id },
          { token: sameUserToken, user: sameUserObject }
        ),
      { message: /Forbidden/ }
    )
  })
})
