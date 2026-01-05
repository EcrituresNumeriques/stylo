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
    assert.deepEqual(
      { email: u.email, username: u.username, displayName: u.displayName },
      {
        email: 'guillaume@domain.org',
        username: 'ggrossetie',
        displayName: 'Guillaume Grossetie',
      }
    )
  })
  test('authenticate using email + password', async () => {
    await User.create({
      email: 'clara@domain.org',
      username: 'cgrometto',
      displayName: 'Clara Grometto',
      password: 's$cret!',
    })
    const u = await checkCredentials({
      username: 'clara@domain.org',
      password: 's$cret!',
    })
    assert.deepEqual(
      { email: u.email, username: u.username, displayName: u.displayName },
      {
        email: 'clara@domain.org',
        username: 'cgrometto',
        displayName: 'Clara Grometto',
      }
    )
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
    assert.deepEqual(
      { email: u.email, displayName: u.displayName },
      {
        email: 'thomas@domain.org',
        displayName: 'thomas',
      }
    )
  })
  test('authenticate using displayName when username is defined + password', async () => {
    await User.create({
      email: 'victor@domain.org',
      username: 'vchaix',
      displayName: 'Victor Chaix',
      password: 'pa$$w0rd',
    })
    await assert.rejects(
      () =>
        checkCredentials({
          username: 'Victor Chaix',
          password: 'pa$$w0rd',
        }),
      {
        message:
          'Unable to authenticate, please check your username and password!',
      }
    )
    const u = await checkCredentials({
      username: 'vchaix',
      password: 'pa$$w0rd',
    })
    assert.deepEqual(
      { email: u.email, username: u.username, displayName: u.displayName },
      {
        email: 'victor@domain.org',
        username: 'vchaix',
        displayName: 'Victor Chaix',
      }
    )
  })
  test('duplicate username', async () => {
    await User.create({
      email: 'bob@marley.org',
      username: 'bm',
      displayName: 'Bob Marley',
      password: 'chill1234',
    })
    await assert.rejects(
      () =>
        User.create({
          email: 'bob@domain.org',
          username: 'bm', // username already exists!
          displayName: 'Bob Mellet',
          password: 'zecr$t!',
        }),
      {
        message:
          'E11000 duplicate key error collection: stylo-tests.users index: username_1 dup key: { username: "bm" }',
      }
    )
  })
  test('missing username', async () => {
    await User.create({
      email: 'david@domain.org',
      displayName: 'David Larlet',
      password: 'pa$$w0rd',
    })
    await User.create({
      email: 'maïtané@domain.org',
      displayName: 'Maïtané Lenoir',
      password: 'pa$$w0rd',
    })
    // username is unique but not mandatory!
  })
})
