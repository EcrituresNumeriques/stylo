const { afterEach, beforeEach, describe, mock, test } = require('node:test')
const assert = require('node:assert')

const config = require('../config.js')
const User = require('../models/user.js')
const {
  getFeatureStates,
  isFeatureEnabled,
  isKnownFeature,
  requireFeature,
  resolveFeatures,
} = require('./features.js')

const userWithOptIn = new User({
  email: 'opt-in@example.com',
  features: ['nakala'],
})
const userWithoutOptIn = new User({ email: 'no-opt-in@example.com' })

describe('features', () => {
  let initialState

  beforeEach(() => {
    initialState = config.get('features.nakala')
  })

  afterEach(() => {
    config.set('features.nakala', initialState)
  })

  describe('isKnownFeature', () => {
    test('returns true for a declared feature', () => {
      assert.equal(isKnownFeature('nakala'), true)
    })

    test('returns false for an unknown feature', () => {
      assert.equal(isKnownFeature('unknown'), false)
      assert.equal(isKnownFeature('toString'), false)
    })
  })

  describe('getFeatureStates', () => {
    test('lists every declared feature with its instance state', () => {
      config.set('features.nakala', 'on')
      assert.deepEqual(
        getFeatureStates().find(({ name }) => name === 'nakala'),
        { name: 'nakala', state: 'on' }
      )
    })
  })

  describe('isFeatureEnabled', () => {
    test('is disabled when the instance state is "off", even with an opt-in', () => {
      config.set('features.nakala', 'off')
      assert.equal(isFeatureEnabled('nakala', userWithOptIn), false)
      assert.equal(isFeatureEnabled('nakala', userWithoutOptIn), false)
    })

    test('is enabled for everyone when the instance state is "on"', () => {
      config.set('features.nakala', 'on')
      assert.equal(isFeatureEnabled('nakala', userWithOptIn), true)
      assert.equal(isFeatureEnabled('nakala', userWithoutOptIn), true)
      assert.equal(isFeatureEnabled('nakala', null), true)
    })

    test('is enabled only for users who opted in when the instance state is "opt-in"', () => {
      config.set('features.nakala', 'opt-in')
      assert.equal(isFeatureEnabled('nakala', userWithOptIn), true)
      assert.equal(isFeatureEnabled('nakala', userWithoutOptIn), false)
      assert.equal(isFeatureEnabled('nakala', null), false)
      assert.equal(isFeatureEnabled('nakala', {}), false)
    })

    test('is disabled for an unknown feature, even with an opt-in', () => {
      const user = new User({ features: ['unknown'] })
      assert.equal(isFeatureEnabled('unknown', user), false)
    })
  })

  describe('resolveFeatures', () => {
    test('returns the features enabled for the user, not the stored opt-ins', () => {
      const user = new User({ features: ['nakala', 'unknown'] })

      config.set('features.nakala', 'opt-in')
      assert.deepEqual(resolveFeatures(user), ['nakala'])

      config.set('features.nakala', 'off')
      assert.deepEqual(resolveFeatures(user), [])
    })

    test('includes features turned on for the instance', () => {
      config.set('features.nakala', 'on')
      assert.deepEqual(resolveFeatures(userWithoutOptIn), ['nakala'])
    })
  })

  describe('requireFeature', () => {
    function createResponse() {
      const res = {}
      res.status = mock.fn(() => res)
      res.json = mock.fn(() => res)
      return res
    }

    test('responds 401 without an authenticated user', () => {
      config.set('features.nakala', 'on')
      const res = createResponse()
      const next = mock.fn()

      requireFeature('nakala')({}, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 401)
      assert.equal(next.mock.callCount(), 0)
    })

    test('responds 403 when the feature is disabled for the user', () => {
      config.set('features.nakala', 'opt-in')
      const res = createResponse()
      const next = mock.fn()

      requireFeature('nakala')({ user: userWithoutOptIn }, res, next)

      assert.equal(res.status.mock.calls[0].arguments[0], 403)
      assert.equal(next.mock.callCount(), 0)
    })

    test('calls next() when the feature is enabled for the user', () => {
      config.set('features.nakala', 'opt-in')
      const res = createResponse()
      const next = mock.fn()

      requireFeature('nakala')({ user: userWithOptIn }, res, next)

      assert.equal(res.status.mock.callCount(), 0)
      assert.equal(next.mock.callCount(), 1)
    })
  })
})
