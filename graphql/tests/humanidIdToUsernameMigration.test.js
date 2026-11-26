const { after, before, beforeEach, describe, test } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')

const {
  copyHumanIdToUsername,
} = require('../migrations/20261126100000-humanid-id-to-username.js')
const { setup, teardown } = require('./harness.js')

describe('humanid id to username migration', () => {
  let container
  let users
  before(async () => {
    container = await setup()
    users = mongoose.connection.db.collection('users')
  })

  after(async () => {
    await teardown(container)
  })

  beforeEach(async () => {
    await users.deleteMany({})
  })

  const withHumanId = (id, fields = {}) => ({
    email: `${id || 'none'}-${Math.random()}@example.com`,
    authProviders: { humanid: { id } },
    ...fields,
  })
  const usernameOf = async (_id) => (await users.findOne({ _id })).username

  test('copies the HumanID identifier to accounts without username', async () => {
    const { insertedIds } = await users.insertMany([
      withHumanId('thom4'),
      withHumanId('ggrossetie', { username: null }),
      withHumanId('mvitali', { username: '' }),
    ])

    const result = await copyHumanIdToUsername(users)

    assert.deepEqual(result, { updated: 3, skipped: [] })
    assert.equal(await usernameOf(insertedIds[0]), 'thom4')
    assert.equal(await usernameOf(insertedIds[1]), 'ggrossetie')
    assert.equal(await usernameOf(insertedIds[2]), 'mvitali')
  })

  test('keeps an existing username', async () => {
    const { insertedId } = await users.insertOne(
      withHumanId('thom4', { username: 'thomas' })
    )

    assert.deepEqual(await copyHumanIdToUsername(users), {
      updated: 0,
      skipped: [],
    })
    assert.equal(await usernameOf(insertedId), 'thomas')
  })

  test('skips an identifier already used as username, even with another case', async () => {
    await users.insertMany([
      { email: 'a@example.com', username: 'thom4' },
      { email: 'b@example.com', username: 'Gflorent' },
    ])
    const { insertedIds } = await users.insertMany([
      withHumanId('thom4'),
      withHumanId('gflorent'),
    ])

    const result = await copyHumanIdToUsername(users)

    assert.deepEqual(result, {
      updated: 0,
      skipped: [
        { _id: insertedIds[0], username: 'thom4' },
        { _id: insertedIds[1], username: 'gflorent' },
      ],
    })
    assert.equal(await usernameOf(insertedIds[0]), undefined)
    assert.equal(await usernameOf(insertedIds[1]), undefined)
  })

  test('ignores deleted accounts and accounts without HumanID identifier', async () => {
    const { insertedIds } = await users.insertMany([
      withHumanId('thom4', { deletedAt: new Date() }),
      withHumanId(''),
      { email: 'local@example.com' },
    ])

    assert.deepEqual(await copyHumanIdToUsername(users), {
      updated: 0,
      skipped: [],
    })
    for (const _id of Object.values(insertedIds)) {
      assert.equal(await usernameOf(_id), undefined)
    }
  })

  // updateOne fails as the unique index would, between findOne and the update
  const failingUpdates = (error) =>
    new Proxy(users, {
      get: (target, key) =>
        key === 'updateOne'
          ? async () => {
              throw error
            }
          : target[key].bind(target),
    })

  test('skips an account rejected by the unique index', async () => {
    const { insertedId } = await users.insertOne(withHumanId('thom4'))
    const duplicate = Object.assign(new Error('E11000'), { code: 11000 })

    assert.deepEqual(await copyHumanIdToUsername(failingUpdates(duplicate)), {
      updated: 0,
      skipped: [{ _id: insertedId, username: 'thom4' }],
    })
  })

  test('stops on any other error', async () => {
    await users.insertOne(withHumanId('thom4'))
    const error = new Error('network')

    await assert.rejects(copyHumanIdToUsername(failingUpdates(error)), error)
  })
})
