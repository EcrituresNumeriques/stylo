const {
  after,
  afterEach,
  before,
  beforeEach,
  describe,
  test,
} = require('node:test')
const assert = require('node:assert')

const config = require('../config.js')
const User = require('../models/user.js')
const { setup, teardown } = require('../tests/harness.js')
const {
  disableFeature,
  enableFeature,
  getUserQuery,
  listFeatures,
  listUsers,
  run,
  showUser,
} = require('./featuresCommand.js')

describe('features command', () => {
  let container
  let initialState

  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  beforeEach(async () => {
    initialState = config.get('features.nakala')
    config.set('features.nakala', 'opt-in')
    await User.deleteMany({})
  })

  afterEach(() => {
    config.set('features.nakala', initialState)
  })

  describe('getUserQuery', () => {
    test('looks up an ObjectId by _id', () => {
      assert.deepEqual(getUserQuery('63977de2f83aa77c5f92cb1c'), {
        _id: '63977de2f83aa77c5f92cb1c',
      })
    })

    test('looks up anything else by email', () => {
      assert.deepEqual(getUserQuery('user@example.com'), {
        email: 'user@example.com',
      })
      // a 12-character string is a valid ObjectId for mongoose, but not an hex string
      assert.deepEqual(getUserQuery('ab@cdefgh.ij'), { email: 'ab@cdefgh.ij' })
    })
  })

  describe('listFeatures', () => {
    test('lists known features and their instance state', () => {
      assert.deepEqual(
        listFeatures().find(({ name }) => name === 'nakala'),
        { name: 'nakala', state: 'opt-in' }
      )
    })
  })

  describe('enableFeature', () => {
    test('adds the feature to the user found by email, once', async () => {
      await User.create({ email: 'user@example.com' })

      await enableFeature('nakala', 'user@example.com')
      const result = await enableFeature('nakala', 'user@example.com')

      assert.deepEqual(result.requested, ['nakala'])
      assert.deepEqual(result.resolved, ['nakala'])
      const user = await User.findOne({ email: 'user@example.com' })
      assert.deepEqual([...user.features], ['nakala'])
    })

    test('adds the feature to the user found by id', async () => {
      const user = await User.create({ email: 'user@example.com' })

      const result = await enableFeature('nakala', user._id.toString())

      assert.deepEqual(result.requested, ['nakala'])
    })

    test('refuses an unknown feature', async () => {
      await User.create({ email: 'user@example.com' })

      await assert.rejects(() => enableFeature('unknown', 'user@example.com'), {
        message: /Unknown feature "unknown"/,
      })
    })

    test('fails when the user does not exist', async () => {
      await assert.rejects(
        () => enableFeature('nakala', 'nobody@example.com'),
        {
          message: /No user found with "nobody@example.com"/,
        }
      )
    })
  })

  describe('disableFeature', () => {
    test('removes the feature from the user', async () => {
      await User.create({ email: 'user@example.com', features: ['nakala'] })

      const result = await disableFeature('nakala', 'user@example.com')

      assert.deepEqual(result.requested, [])
      assert.deepEqual(result.resolved, [])
    })

    test('refuses an unknown feature', async () => {
      await assert.rejects(
        () => disableFeature('unknown', 'user@example.com'),
        {
          message: /Unknown feature "unknown"/,
        }
      )
    })

    test('fails when the user does not exist', async () => {
      await assert.rejects(
        () => disableFeature('nakala', 'nobody@example.com'),
        { message: /No user found with "nobody@example.com"/ }
      )
    })
  })

  describe('showUser', () => {
    test('returns requested and resolved features', async () => {
      const user = await User.create({
        email: 'user@example.com',
        features: ['nakala'],
      })

      config.set('features.nakala', 'off')
      const result = await showUser('user@example.com')

      assert.deepEqual(result, {
        id: user._id.toString(),
        email: 'user@example.com',
        requested: ['nakala'],
        resolved: [],
      })
    })

    test('fails when the user does not exist', async () => {
      await assert.rejects(() => showUser('nobody@example.com'), {
        message: /No user found with "nobody@example.com"/,
      })
    })
  })

  describe('listUsers', () => {
    test('lists users who requested the feature', async () => {
      await User.create({ email: 'with@example.com', features: ['nakala'] })
      await User.create({ email: 'without@example.com' })

      const result = await listUsers('nakala')

      assert.deepEqual(
        result.map(({ email }) => email),
        ['with@example.com']
      )
    })

    test('refuses an unknown feature', async () => {
      await assert.rejects(() => listUsers('unknown'), {
        message: /Unknown feature "unknown"/,
      })
    })
  })

  describe('run', () => {
    test('dispatches each command', async () => {
      await User.create({ email: 'user@example.com' })

      assert.deepEqual(await run(['list']), listFeatures())
      assert.deepEqual(
        (await run(['enable', 'nakala', 'user@example.com'])).requested,
        ['nakala']
      )
      assert.deepEqual((await run(['show', 'user@example.com'])).requested, [
        'nakala',
      ])
      assert.deepEqual(
        (await run(['users', 'nakala'])).map(({ email }) => email),
        ['user@example.com']
      )
      assert.deepEqual(
        (await run(['disable', 'nakala', 'user@example.com'])).requested,
        []
      )
    })

    test('fails on a missing argument', async () => {
      await assert.rejects(() => run(['enable', 'nakala']), {
        message: /^Usage:/,
      })
      await assert.rejects(() => run(['show']), { message: /^Usage:/ })
      await assert.rejects(() => run(['users']), { message: /^Usage:/ })
    })

    test('fails on an unknown or missing command', async () => {
      await assert.rejects(() => run(['unknown']), { message: /^Usage:/ })
      await assert.rejects(() => run([]), { message: /^Usage:/ })
    })
  })
})
