const { Mutation } = require('./userResolver.js')
const User = require('../models/user.js')
const { before, beforeEach, after, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness')

describe('user resolver', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  beforeEach(async () => {
    // purge user collection
    await User.deleteMany({})
  })

  describe('setAuthToken', () => {
    test('throws an error when no pendingRegistration data in session', async () => {
      const user = new User({ email: 'user1@example.com' })
      await user.save()
      const context = {
        user,
        token: { admin: false, _id: user.id },
        session: {},
      }

      await assert.rejects(
        () =>
          Mutation.setAuthToken(
            {},
            {
              service: 'zotero',
            },
            context
          ),
        {
          message: 'No remote account data found',
        }
      )
    })

    test('sets a token for an existing linked account', async () => {
      const user = new User({ email: 'user2@example.com' })
      await user.save()
      const id = user.id

      const context = {
        user,
        token: { admin: false, _id: id },
        session: {
          pendingRegistration: {
            authProviders: {
              zotero: {
                id: 'abcd',
                token: 'abcd',
              },
            },
          },
        },
      }

      const u = await Mutation.setAuthToken(
        {},
        {
          service: 'zotero',
        },
        context
      )

      const zotero = u.authProviders.get('zotero')
      assert.equal(zotero.token, 'abcd')
      assert.equal(context.pendingRegistration, undefined)
    })

    test('sets a token for a new linked account', async () => {
      const user = new User({ email: 'user3@example.com' })
      await user.save()
      const context = {
        user,
        token: { admin: false, _id: user.id },
        session: {
          fromAccount: true,
          pendingRegistration: {
            authProviders: {
              zotero: {
                id: 'abcd',
                token: 'abcd',
              },
            },
          },
        },
      }

      const u = await Mutation.setAuthToken(
        {},
        {
          service: 'zotero',
        },
        context
      )

      const zotero = u.authProviders.get('zotero')
      assert.equal(zotero.token, 'abcd')
      assert.equal(context.pendingRegistration, undefined)
      assert.equal(context.fromAccount, undefined)
    })

    test('rejects when linking with an already linked account', async () => {
      const user = new User({ email: 'user4@example.com' })
      user.set('authProviders.zotero', {
        id: 'abcd',
      })
      await user.save()

      const context = {
        user,
        token: { admin: false, _id: user.id },
        session: {
          fromAccount: true,
          pendingRegistration: {
            authProviders: {
              zotero: {
                id: 'abcd',
                token: 'abcd',
              },
            },
          },
        },
      }

      await assert.rejects(
        () =>
          Mutation.setAuthToken(
            {},
            {
              service: 'zotero',
            },
            context
          ),
        {
          message: 'This account is already linked to another Stylo user.',
        }
      )
    })

    test('throws an error with an unknown user', async () => {
      const context = {
        token: {},
        user: null,
      }

      await assert.rejects(
        () =>
          Mutation.setAuthToken(
            {},
            {
              service: 'zotero',
              token: 'abcd',
            },
            context
          ),
        {
          message: 'Unauthorized [context []]',
        }
      )
    })
  })

  describe('unsetAuthToken', () => {
    test('remove a zotero token', async () => {
      const user = new User({
        email: 'user5@example.com',
        authProviders: {
          humanid: {
            id: 'h-abcd',
            token: 'hn-token-abdc',
          },
          zotero: {
            id: 'z-abdc',
            token: 'z-token-abcd',
          },
        },
      })
      await user.save()
      const context = {
        user,
        token: { admin: false, _id: user.id },
      }

      const u = await Mutation.unsetAuthToken(
        {},
        {
          service: 'zotero',
        },
        context
      )

      assert.equal(u.authProviders.get('zotero'), null)
    })

    test('rejects when removing last token', async () => {
      const user = new User({
        email: 'user6@example.com',
        authProviders: {
          humanid: {
            id: 'h-abcd',
            token: 'hn-token-abdc',
          },
          zotero: {
            id: 'z-abdc',
            token: 'z-token-abcd',
          },
        },
      })
      await user.save()
      user.set('authProviders.humanid', null)
      await user.save()

      const context = {
        user,
        token: { admin: false, _id: user.id },
      }

      await assert.rejects(
        () =>
          Mutation.unsetAuthToken(
            {},
            {
              service: 'zotero',
            },
            context
          ),
        {
          message: 'You cannot remove the last authentication method',
        }
      )
    })

    test('throws an error with an unknown user', async () => {
      const context = {
        token: {},
        user: null,
      }

      await assert.rejects(
        () =>
          Mutation.setAuthToken(
            {},
            {
              service: 'zotero',
              token: 'abcd',
            },
            context
          ),
        {
          message: 'Unauthorized [context []]',
        }
      )
    })
  })

  describe('createUser', () => {
    test('rejects when an account with idential email exists', async () => {
      const user = new User({ email: 'user7@example.com' })
      await user.save()
      await assert.rejects(
        () =>
          Mutation.createUser(
            {},
            {
              details: {
                email: 'user7@example.com',
              },
            }
          ),
        {
          message: 'User with this email already exists!',
        }
      )
    })

    test('creates with form data', async () => {
      const u = await Mutation.createUser(
        {},
        {
          details: {
            blah: 'this field will be ignored',
            email: ' test-with-space@example.com ',
            username: ' jane.doe ',
          },
        }
      )

      assert.equal(u.email, 'test-with-space@example.com')
      assert.equal(u.username, 'jane.doe')
      assert.equal(u.displayName, 'jane.doe')
    })
  })

  describe('createUserWithAuth', () => {
    test('rejects when no pending registration', async () => {
      const context = {
        token: null,
        session: {},
      }

      await assert.rejects(
        () =>
          Mutation.createUserWithAuth(
            {},
            {
              service: 'zotero',
            },
            context
          ),
        {
          message: 'No registration found',
        }
      )
    })

    test('creates with both form and pending data', async () => {
      const context = {
        token: null,
        session: {
          pendingRegistration: {
            displayName: 'Jane Doe',
            authProviders: {
              zotero: {
                id: 'abcd',
                token: 'efgh',
              },
            },
          },
        },
      }

      const jwt = await Mutation.createUserWithAuth(
        {},
        {
          service: 'zotero',
          details: {
            firstName: 'Jane',
          },
        },
        context
      )

      const u = await User.findOne({
        'authProviders.zotero.id': 'abcd',
      })

      assert.equal(u.displayName, 'Jane Doe')
      assert.equal(u.firstName, 'Jane')

      // because `authProviders` is a Map object
      const testProvider = u.authProviders.get('zotero')
      assert.equal(testProvider.id, 'abcd')
      assert.equal(testProvider.token, 'efgh')

      assert.match(
        jwt,
        // eslint-disable-next-line security/detect-unsafe-regex
        /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/
      )
    })
  })
})
