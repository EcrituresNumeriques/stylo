const isUser = require('./isUser.js')
const UserModel = require('../models/user.js')

const user = '63977de2f83aa77c5f92cb1c'
const sameUserObject = new UserModel({ _id: user })
const sameUserToken = {
  _id: user,
  email: 'test@example.com',
  session: true,
  authType: 'oidc',
}

const differentUserObject = new UserModel({ _id: '00000de2f83aa77c5f92dc2f' })

const adminToken = { admin: true, roles: ['read'], readonly: true }

describe('isUser', () => {
  test('without token, no args.user', () => {
    expect(() => isUser({}, { token: {} })).toThrow(/Unauthorized/)
  })

  test('without token, explicit args.user', () => {
    expect(() => isUser({ user }, { token: {} })).toThrow(/Unauthorized/)
  })

  test('with admin token, explicit args.user', () => {
    expect(isUser({ user }, { token: adminToken })).toEqual({ userId: user })
  })

  test('with admin token, no args.user', () => {
    expect(isUser({}, { token: adminToken })).toEqual({ userId: null })
  })

  test('with token, implicit user is token user', () => {
    expect(isUser({}, { token: sameUserToken, user: sameUserObject })).toEqual({
      userId: sameUserToken._id,
    })
  })

  test('with token, explicit user is same as user token', () => {
    expect(
      isUser({ user }, { token: sameUserToken, user: sameUserObject })
    ).toEqual({ userId: user })
  })

  test('with token, explicit user is different than user token', () => {
    expect(() =>
      isUser(
        { user: differentUserObject.id },
        { token: sameUserToken, user: sameUserObject }
      )
    ).toThrow(/Forbidden/)
  })
})
