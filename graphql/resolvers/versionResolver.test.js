import Version from '../models/version.js'
import {
  Mutation as VersionMutation,
  Query as VersionQuery,
  Version as VersionResolver,
} from './versionResolver.js'
// registers the User model used by populate('owner')
import '../models/user.js'
import assert from 'node:assert'
import { after, before, describe, test } from 'node:test'
import mongoose from 'mongoose'
import { setup, teardown } from '../tests/harness.js'

const { ObjectId } = mongoose.Types

describe('Version resolver', () => {
  let container

  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  describe('Query.version', () => {
    test('fetches a version with the versionId argument', async () => {
      const version = await Version.create({
        owner: new ObjectId(),
        message: 'With versionId',
      })

      const result = await VersionQuery.version({}, { versionId: version._id })
      assert.equal(result.message, 'With versionId')
    })

    test('still accepts the deprecated version argument', async () => {
      const version = await Version.create({
        owner: new ObjectId(),
        message: 'With version',
      })

      const result = await VersionQuery.version({}, { version: version._id })
      assert.equal(result.message, 'With version')
    })

    test('requires the version identifier', async () => {
      await assert.rejects(
        () => VersionQuery.version({}, {}),
        (error) => error.extensions.code === 'INVALID_INPUT'
      )
    })
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
