const { describe, test } = require('node:test')
const assert = require('node:assert')
const { requireArgument } = require('./arguments.js')

describe('requireArgument', () => {
  test('returns the new form when given', () => {
    assert.deepEqual(requireArgument('input', { a: 1 }, { a: 2 }), { a: 1 })
  })

  test('falls back to the deprecated form', () => {
    assert.deepEqual(requireArgument('input', undefined, { a: 2 }), { a: 2 })
    assert.equal(requireArgument('articleId', null, 'abc'), 'abc')
  })

  test('keeps falsy values that are not null or undefined', () => {
    assert.equal(requireArgument('order', 0, 1), 0)
  })

  test('throws a bad request error when no form is given', () => {
    assert.throws(
      () => requireArgument('input', undefined, null),
      (error) =>
        error.extensions.code === 'INVALID_INPUT' &&
        error.message === 'Argument "input" is required.'
    )
  })
})
