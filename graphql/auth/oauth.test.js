const User = require('../models/user.js')
const config = require('../config.js')

const { after, before, describe, mock, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

config.load({
  zotero: { auth: { clientKey: 'key', clientSecret: 'secret' } },
  hypothesis: { auth: { clientId: 'id' } },
  oauthProvider: {
    issuer: 'https://humanid.example',
    auth: {
      url: 'https://humanid.example/auth',
      tokenUrl: 'https://humanid.example/token',
      userInfo: 'https://humanid.example/userinfo',
    },
    client: { id: 'id', secret: 'secret' },
  },
})

/**
 * Calls a passport `verify` callback the way its strategy does,
 * and resolves with the user given to `done`, or with the redirection.
 */
const services = [
  {
    service: 'zotero',
    remoteId: 'zotero-1',
    profile: { userID: 'zotero-1', username: 'jane' },
    call: (verify, req, self, done) =>
      verify.call(self, req, 'token', 'secret', {}, {}, done),
  },
  {
    service: 'hypothesis',
    remoteId: 'acct:jane@hypothes.is',
    profile: {
      userid: 'acct:jane@hypothes.is',
      user_info: { display_name: 'Jane' },
    },
    call: (verify, req, self, done) =>
      verify.call(self, req, 'token', null, null, done),
  },
  {
    service: 'humanid',
    remoteId: 'humanid-1',
    call: (verify, req, self, done) =>
      verify.call(
        self,
        req,
        'issuer',
        {
          id: 'humanid-1',
          displayName: 'Jane',
          emails: [{ value: 'jane@humanid.example' }],
        },
        {},
        'idToken',
        'token',
        'refreshToken',
        done
      ),
  },
]

describe('OAuth verify callbacks', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  for (const { service, remoteId, profile, call } of services) {
    describe(service, () => {
      const { verify } = require(`./${service}.js`)
      const run = (req) =>
        new Promise((resolve, reject) => {
          mock.method(globalThis, 'fetch', async () => ({
            json: async () => profile,
          }))
          const self = { redirect: (url) => resolve({ redirect: url }) }
          call(verify, req, self, (error, user) =>
            error ? reject(error) : resolve({ user })
          )
        }).finally(() => mock.restoreAll())

      test('records an access when an account logs in', async () => {
        const linkedAt = new Date('2026-01-01')
        await User.create({
          email: `${service}-login@example.com`,
          authProviders: { [service]: { id: remoteId, linkedAt } },
        })

        await run({ ip: '192.168.1.42', session: {} })

        const user = await User.findOne({
          email: `${service}-login@example.com`,
        })
        assert.equal(user.lastAccesses.length, 1)
        assert.equal(user.lastAccesses[0].strategy, service)
        assert.equal(user.lastAccesses[0].ip, '192.168.1.0')
        assert.equal(user.authProviders.get(service).token, 'token')
        assert.deepEqual(user.authProviders.get(service).linkedAt, linkedAt)
      })

      test('records no access when linking an account', async () => {
        await User.findOneAndUpdate(
          { [`authProviders.${service}.id`]: remoteId },
          { lastAccesses: [] }
        )

        await run({ session: { fromAccount: service } })

        const user = await User.findOne({
          [`authProviders.${service}.id`]: remoteId,
        })
        assert.equal(user.lastAccesses.length, 0)
      })

      test('keeps an unknown account for registration', async () => {
        await User.deleteMany({ [`authProviders.${service}.id`]: remoteId })
        const session = { origin: 'https://stylo.example' }

        const { redirect } = await run({ session })

        assert.match(redirect, new RegExp(`/register/${service}`))
        assert.equal(
          session.pendingRegistration.authProviders[service].id,
          remoteId
        )
        assert.equal(
          await User.countDocuments({
            [`authProviders.${service}.id`]: remoteId,
          }),
          0
        )
      })
    })
  }
})
