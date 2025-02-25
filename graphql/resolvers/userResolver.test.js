const { Mutation } = require('./userResolver.js')
const User = require('../models/user.js')

describe('setAuthToken', () => {
  let user

  beforeEach(async () => {
    user = new User({ email: 'test@example.com' })
    await user.save()
  })

  test('saves a new zotero token', async () => {
    const id = user.id

    const context = {
      user,
      token: { admin: false, _id: id },
    }

    const u = await Mutation.setAuthToken(
      {},
      {
        service: 'zotero',
        token: 'abcd',
      },
      context
    )

    expect(u).toHaveProperty('zoteroToken', 'abcd')
  })

  test('remove a new zotero token', async () => {
    const id = user.id
    user.set('zoteroToken', 'abcd')
    await user.save()

    const context = {
      user,
      token: { admin: false, _id: id },
    }

    const u = await Mutation.setAuthToken(
      {},
      {
        service: 'zotero',
        token: null,
      },
      context
    )

    expect(u).toHaveProperty('zoteroToken', null)
  })

  test('throws an error with an unknown service', async () => {
    const id = user.id

    const context = {
      user,
      token: { admin: false, _id: id },
    }

    return expect(
      Mutation.setAuthToken(
        {},
        {
          service: 'humanid',
          token: 'abcd',
        },
        context
      )
    ).rejects.toThrow('Service unknown (humanid)')
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
