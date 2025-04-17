const { Mutation } = require('./userResolver.js')
const User = require('../models/user.js')

describe('setAuthToken', () => {
  let user

  beforeEach(async () => {
    user = new User({ email: 'test@example.com' })
    await user.save()
  })

  test('thows an error when no pendingRegistration data in session', async () => {
    const context = {
      user,
      token: { admin: false, _id: user.id },
      session: {},
    }

    const result = Mutation.setAuthToken(
      {},
      {
        service: 'zotero',
      },
      context
    )

    return expect(result).rejects.toThrow('No remote account data found')
  })

  test('sets a token for an existing linked account', async () => {
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

    await expect(u.authProviders.get('zotero')).toHaveProperty('token', 'abcd')
    await expect(context.pendingRegistration).toBeUndefined()
  })

  test('sets a token for a new linked account', async () => {
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

    await expect(u.authProviders.get('zotero')).toHaveProperty('token', 'abcd')
    await expect(context.pendingRegistration).toBeUndefined()
    await expect(context.fromAccount).toBeUndefined()
  })

  test('rejects when linking with an already linked account', async () => {
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

    const result = Mutation.setAuthToken(
      {},
      {
        service: 'zotero',
      },
      context
    )

    return expect(result).rejects.toThrow(
      'This account is already linked to another Stylo user.'
    )
  })

  test('throws an error with an unknown user', async () => {
    const context = {
      token: {},
      user: null,
    }

    return expect(
      Mutation.setAuthToken(
        {},
        {
          service: 'zotero',
          token: 'abcd',
        },
        context
      )
    ).rejects.toThrow('Unauthorized [context []]')
  })
})

describe('unsetAuthToken', () => {
  let user

  beforeEach(async () => {
    user = new User({
      email: 'test@example.com',
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
  })

  test('remove a zotero token', async () => {
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

    return expect(u.authProviders.get('zotero')).toBeNull()
  })

  test('rejects when removing last token', async () => {
    user.set('authProviders.humanid', null)
    await user.save()

    const context = {
      user,
      token: { admin: false, _id: user.id },
    }

    const result = Mutation.unsetAuthToken(
      {},
      {
        service: 'zotero',
      },
      context
    )

    return expect(result).rejects.toThrow(
      'You cannot remove the last authentication method'
    )
  })

  test('throws an error with an unknown user', async () => {
    const context = {
      token: {},
      user: null,
    }

    return expect(
      Mutation.setAuthToken(
        {},
        {
          service: 'zotero',
          token: 'abcd',
        },
        context
      )
    ).rejects.toThrow('Unauthorized [context []]')
  })
})

describe('createUser', () => {
  let user

  beforeEach(async () => {
    user = new User({ email: 'test@example.com' })
    await user.save()
  })

  test('rejects when an account with idential email exists', async () => {
    const result = Mutation.createUser(
      {},
      {
        details: {
          email: 'test@example.com',
        },
      }
    )

    return expect(result).rejects.toThrow(
      'User with this email already exists!'
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

    await expect(u).toHaveProperty('email', 'test-with-space@example.com')
    await expect(u).toHaveProperty('username', 'jane.doe')
    await expect(u).toHaveProperty('displayName', 'jane.doe')
  })
})

describe('createUserWithAuth', () => {
  test('rejects when no pending registration', async () => {
    const context = {
      token: null,
      session: {},
    }

    const result = Mutation.createUserWithAuth(
      {},
      {
        service: 'zotero',
      },
      context
    )

    return expect(result).rejects.toThrow('No registration found')
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

    await expect(u).toHaveProperty('displayName', 'Jane Doe')
    await expect(u).toHaveProperty('firstName', 'Jane')

    // because `authProviders` is a Map object
    const testProvider = u.authProviders.get('zotero')
    await expect(testProvider).toMatchObject({
      id: 'abcd',
      token: 'efgh',
    })

    return expect(jwt).toMatch(
      // eslint-disable-next-line security/detect-unsafe-regex
      /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/
    )
  })
})
