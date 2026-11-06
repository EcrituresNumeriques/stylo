const { InstanceUsageStats } = require('./statsResolver.js')
const User = require('../models/user.js')
const { after, before, beforeEach, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

describe('stats resolver', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  beforeEach(async () => {
    await User.deleteMany({})
  })

  describe('InstanceUsageStats.users', () => {
    test('counts zero when there is no user', async () => {
      const stats = await InstanceUsageStats.users()
      assert.deepEqual(stats, { total: 0, local: 0, openid: 0, years: [] })
    })

    test('counts the users by authentication method', async () => {
      await User.create({ email: 'local@example.com', password: 'secret' })
      await User.create({
        email: 'oidc@example.com',
        authProviders: { humanid: { id: 'humanid-1' } },
      })
      await User.create({
        email: 'both@example.com',
        password: 'secret',
        authProviders: { humanid: { email: 'both@example.com' } },
      })
      // a linked service (Zotero) is not an authentication method
      await User.create({
        email: 'zotero@example.com',
        authProviders: { zotero: { token: 'token' } },
      })

      const stats = await InstanceUsageStats.users()
      assert.equal(stats.local, 2)
      assert.equal(stats.openid, 2)
      assert.deepEqual(stats.years, [
        { year: new Date().getFullYear(), count: 4 },
      ])
    })

    test('counts local users when no user authenticates with OpenID Connect', async () => {
      await User.create({ email: 'local@example.com', password: 'secret' })

      const stats = await InstanceUsageStats.users()
      assert.equal(stats.local, 1)
      assert.equal(stats.openid, 0)
    })
  })
})
