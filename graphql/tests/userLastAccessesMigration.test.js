const mongoose = require('mongoose')
const { up } = require('../migrations/20261126000338-user-last-accesses.js')

const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('./harness.js')

describe('migration user-last-accesses', () => {
  let container
  let users
  before(async () => {
    container = await setup()
    users = mongoose.connection.db.collection('users')
  })

  after(async () => {
    await teardown(container)
  })

  const migrate = ({ dryRun = false } = {}) =>
    up({
      internals: { dryRun },
      _getDbInstance: () => mongoose.connection.db,
    })

  test('changes nothing in a dry run', async () => {
    const connectedAt = new Date('2026-01-01')
    const { insertedId } = await users.insertOne({ connectedAt })

    await migrate({ dryRun: true })

    const user = await users.findOne({ _id: insertedId })
    assert.deepEqual(user, { _id: insertedId, connectedAt })
  })

  test('moves connectedAt into lastAccesses', async () => {
    const connectedAt = new Date('2026-01-01')
    const { insertedId } = await users.insertOne({ connectedAt })

    await migrate()

    const user = await users.findOne({ _id: insertedId })
    assert.deepEqual(user.lastAccesses, [
      { at: connectedAt, ip: null, strategy: null },
    ])
    assert.equal('connectedAt' in user, false)
  })

  test('leaves a user without connectedAt untouched', async () => {
    const { insertedId } = await users.insertOne({ email: 'never@example.com' })

    await migrate()

    const user = await users.findOne({ _id: insertedId })
    assert.deepEqual(user, { _id: insertedId, email: 'never@example.com' })
  })
})
