const { describe, test, mock } = require('node:test')
const assert = require('node:assert')

const {
  assertFeature,
  isFeatureEnabled,
  loadFeatures,
  requireFeature,
  resolveFeatures,
  validateFeatures,
} = require('./features.js')
const { NotAuthenticatedError, NotAuthorizedError } = require('./errors.js')

const fixture = `${__dirname}/__fixtures__/features.json`
const features = require(fixture)

describe('features', () => {
  test('isFeatureEnabled', () => {
    const cases = [
      ['nakala', undefined, true],
      ['closed', 'thom4', false],
      ['byUser', 'thom4', true],
      ['byUser', 'ggrossetie', false],
      ['byUser', undefined, false],
      ['byGroup', 'ggrossetie', true],
      ['byGroup', 'stranger', false],
      ['unknown', 'thom4', false],
    ]
    for (const [name, username, expected] of cases) {
      assert.equal(
        isFeatureEnabled(name, { username }, features),
        expected,
        `${name} for ${username}`
      )
    }
  })

  test('resolveFeatures', () => {
    assert.deepEqual(resolveFeatures({ username: 'thom4' }, features), [
      'nakala',
      'webdav',
      'byUser',
      'byGroup',
    ])
    assert.deepEqual(resolveFeatures({}, features), ['nakala', 'webdav'])
  })

  test('validateFeatures', () => {
    const cases = [
      [{ groups: { 'Labo Ecrinum': [] } }, /invalid group name/],
      [{ groups: { labo: 'thom4' } }, /groups\.labo must be a list/],
      [{ flags: { a: 'on' } }, /flags\.a\.state must be one of/],
      [{ flags: { a: { state: 'on', users: [1] } } }, /flags\.a\.users/],
      [{ flags: { a: { state: 'on', groups: 'x' } } }, /flags\.a\.groups/],
      [{ flags: { a: { state: 'on', groups: ['x'] } } }, /undeclared group/],
    ]
    for (const [definition, error] of cases) {
      assert.match(validateFeatures(definition), error)
    }
    assert.equal(validateFeatures(features), undefined)
  })

  test('loadFeatures', () => {
    assert.throws(() => loadFeatures('/nonexistent.json'), /Invalid features/)
    loadFeatures(fixture)
    assert.equal(isFeatureEnabled('byUser', { username: 'thom4' }), true)
    loadFeatures('graphql/helpers/__fixtures__/features.json')
    assert.equal(isFeatureEnabled('byUser', { username: 'thom4' }), true)
    loadFeatures('')
    assert.deepEqual(resolveFeatures({ username: 'thom4' }), [])
  })

  test('requireFeature', () => {
    loadFeatures(fixture)
    const middleware = requireFeature('byUser')
    for (const [user, status] of [
      [undefined, 401],
      [{ username: 'stranger' }, 403],
    ]) {
      const res = { status: mock.fn(() => res), json: mock.fn() }
      middleware({ user }, res, () => assert.fail('next() called'))
      assert.equal(res.status.mock.calls[0].arguments[0], status)
    }
    const next = mock.fn()
    middleware({ user: { username: 'thom4' } }, {}, next)
    assert.equal(next.mock.callCount(), 1)
    loadFeatures('')
  })

  test('assertFeature', () => {
    loadFeatures(fixture)
    assert.throws(() => assertFeature('byUser', {}), NotAuthenticatedError)
    assert.throws(
      () => assertFeature('byUser', { user: { username: 'x' } }),
      NotAuthorizedError
    )
    assertFeature('byUser', { user: { username: 'thom4' } })
    loadFeatures('')
  })
})
