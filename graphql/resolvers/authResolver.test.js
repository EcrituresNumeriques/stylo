const { checkCredentials } = require('./authResolver')
const User = require('../models/user')
const { describe, test, before, after } = require('node:test')
const assert = require('node:assert')

const { setup, teardown } = require('../tests/harness')

describe('auth resolver', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  test('authenticate using username + password', async () => {
    await User.create({
      email: 'guillaume@domain.org',
      username: 'ggrossetie',
      displayName: 'Guillaume Grossetie',
      password: 's$cret!',
    })
    const u = await checkCredentials({
      username: 'ggrossetie',
      password: 's$cret!',
    })
    console.log({ u })
    assert.deepEqual(u, {
      email: 'guillaume@domain.org',
      username: 'ggrossetie',
      displayName: 'Guillaume Grossetie',
    })
  })
  test('authenticate using email + password', async () => {
    await User.create({
      email: 'guillaume@domain.org',
      username: 'ggrossetie',
      displayName: 'Guillaume Grossetie',
      password: 's$cret!',
    })
    const u = await checkCredentials({
      username: 'guillaume@domain.org',
      password: 's$cret!',
    })
    assert.deepEqual(u, {
      email: 'guillaume@domain.org',
      username: 'ggrossetie',
      displayName: 'Guillaume Grossetie',
    })
  })
  test('authenticate using displayName + password', async () => {
    await User.create({
      email: 'thomas@domain.org',
      displayName: 'thomas',
      password: 'pa$$w0rd',
    })
    const u = await checkCredentials({
      username: 'thomas',
      password: 'pa$$w0rd',
    })
    assert.deepEqual(u, {
      email: 'thomas@domain.org',
      displayName: 'thomas',
    })
  })
  test('authenticate using displayName when username is defined + password', async () => {
    await User.create({
      email: 'thomas@domain.org',
      username: 'tparisot',
      displayName: 'Thomas Parisot',
      password: 'pa$$w0rd',
    })
    await assert.rejects(
      () =>
        checkCredentials({
          username: 'Thomas Parisot',
          password: 'pa$$w0rd',
        }),
      {
        message:
          'Unable to authenticate, please check your username and password!',
      }
    )
    const u = await checkCredentials({
      username: 'tparisot',
      password: 'pa$$w0rd',
    })
    assert.deepEqual(u, {
      email: 'thomas@domain.org',
      username: 'tparisot',
      displayName: 'Thomas Parisot',
    })
  })
  test('duplicate username', async () => {
    await User.create({
      email: 'thomas@domain.org',
      username: 'bob',
      displayName: 'Thomas Parisot',
      password: 'pa$$w0rd',
    })
    await assert.rejects(
      () =>
        User.create({
          email: 'guillaume@domain.org',
          username: 'bob', // username already exists!
          displayName: 'Guillaume Grossetie',
          password: 'pa$$w0rd',
        }),
      {
        message:
          'E11000 duplicate key error collection: stylo-tests.users index: username_1 dup key: { username: "bob" }',
      }
    )
  })
  test('missing username', async () => {
    await User.create({
      email: 'thomas@domain.org',
      displayName: 'Thomas Parisot',
      password: 'pa$$w0rd',
    })
    await User.create({
      email: 'guillaume@domain.org',
      displayName: 'Guillaume Grossetie',
      password: 'pa$$w0rd',
    })
    // username is unique but not mandatory!
  })
})
