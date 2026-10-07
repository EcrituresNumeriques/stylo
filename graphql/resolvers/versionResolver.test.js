const {
  Mutation: VersionMutation,
  Version: VersionResolver,
} = require('./versionResolver')
const Version = require('../models/version')
const { ObjectId } = require('mongoose').Types
const { before, after, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness')

describe('Version resolver', () => {
  let container

  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  describe('Mutation.renameVersion', () => {
    test('returns the updated version', async () => {
      const version = await Version.create({
        owner: new ObjectId(),
        message: 'Old message',
      })

      const result = await VersionMutation.renameVersion(
        {},
        { versionId: version._id, name: 'New message' }
      )

      assert.equal(result._id.toString(), version._id.toString())
      assert.equal(result.message, 'New message')
      const updated = await Version.findById(version._id)
      assert.equal(updated.message, 'New message')
    })

    test('deprecated Version.rename still returns a boolean', async () => {
      const version = await Version.create({
        owner: new ObjectId(),
        message: 'Old message',
      })

      const result = await VersionResolver.rename(version, { name: 'Renamed' })

      assert.equal(result, true)
    })
  })
})
