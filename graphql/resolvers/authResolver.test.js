const {
  checkCredentials,
  Mutation,
  passwordFailures,
} = require('./authResolver')
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
  test('refuses to authenticate an account without password', async () => {
    await User.create({
      email: 'humanid@domain.org',
      username: 'humanid',
      displayName: 'HumanID',
    })
    await assert.rejects(
      checkCredentials({ username: 'humanid', password: '' }),
      { status: 403 }
    )
  })

  describe('changePassword', () => {
    function context(user) {
      return { token: { _id: user.id }, user }
    }

    test('requires the current password', async () => {
      const user = await User.create({
        email: 'change@domain.org',
        password: 'old-pa$$word',
      })
      await assert.rejects(
        Mutation.changePassword(
          null,
          { input: { currentPassword: 'wrong', newPassword: 'new-pa$$word' } },
          context(user)
        ),
        { message: 'Old password is incorrect' }
      )
      await Mutation.changePassword(
        null,
        {
          input: {
            currentPassword: 'old-pa$$word',
            newPassword: 'new-pa$$word',
          },
        },
        context(user)
      )
      const updated = await User.findById(user.id)
      assert.equal(await updated.comparePassword('new-pa$$word'), true)
    })

    test('blocks the current password check after too many failures', async () => {
      const user = await User.create({
        email: 'brute@domain.org',
        password: 'old-pa$$word',
      })
      const change = (currentPassword) =>
        Mutation.changePassword(
          null,
          { input: { currentPassword, newPassword: 'new-pa$$word' } },
          context(user)
        )
      for (let i = 0; i < 10; i++) {
        await assert.rejects(change('wrong'), {
          message: 'Old password is incorrect',
        })
      }
      assert.equal(await passwordFailures.isBlocked(user.id), true)
      await assert.rejects(
        change('old-pa$$word'),
        (error) => error.extensions.code === 'TOO_MANY_ATTEMPTS'
      )
    })

    test('counts concurrent checks of the current password', async () => {
      const user = await User.create({
        email: 'parallel@domain.org',
        password: 'old-pa$$word',
      })
      const results = await Promise.allSettled(
        Array.from({ length: 15 }, () =>
          Mutation.changePassword(
            null,
            { input: { currentPassword: 'wrong', newPassword: 'x' } },
            context(user)
          )
        )
      )
      const tooMany = results.filter(
        (r) => r.reason?.extensions?.code === 'TOO_MANY_ATTEMPTS'
      )
      assert.equal(tooMany.length, 5)
    })

    test('forgets the failures after a successful change', async () => {
      const user = await User.create({
        email: 'typo@domain.org',
        password: 'old-pa$$word',
      })
      const change = (currentPassword, newPassword) =>
        Mutation.changePassword(
          null,
          { input: { currentPassword, newPassword } },
          context(user)
        )
      for (let i = 0; i < 9; i++) {
        await assert.rejects(change('wrong', 'new-pa$$word'))
      }
      await change('old-pa$$word', 'new-pa$$word')
      await assert.rejects(change('wrong', 'other-pa$$word'), {
        message: 'Old password is incorrect',
      })
      assert.equal(await passwordFailures.isBlocked(user.id), false)
    })

    test('sets the first password of an account without password', async () => {
      const user = await User.create({ email: 'first@domain.org' })
      await Mutation.changePassword(
        null,
        { input: { currentPassword: '', newPassword: 'first-pa$$word' } },
        context(user)
      )
      const updated = await User.findById(user.id)
      assert.equal(await updated.comparePassword('first-pa$$word'), true)
    })
  })
})
