const { computeMajorVersion, computeMinorVersion } = require('./versions.js')

const { describe, test } = require('node:test')
const assert = require('node:assert')

describe('computeVersion', () => {
  test('computeMajorVersion', () => {
    assert.deepEqual(computeMajorVersion(undefined), {
      version: 1,
      revision: 0,
    })
    assert.deepEqual(computeMajorVersion({ version: 0, revision: 0 }), {
      version: 1,
      revision: 0,
    })
    assert.deepEqual(computeMajorVersion({ version: 1, revision: 0 }), {
      version: 2,
      revision: 0,
    })
    assert.deepEqual(computeMajorVersion({ version: 1, revision: 9 }), {
      version: 2,
      revision: 0,
    })
  })

  test('computeMinorVersion', () => {
    assert.deepEqual(computeMinorVersion(undefined), {
      version: 0,
      revision: 1,
    })
    assert.deepEqual(computeMinorVersion({ version: 0, revision: 0 }), {
      version: 0,
      revision: 1,
    })
    assert.deepEqual(computeMinorVersion({ version: 1, revision: 0 }), {
      version: 1,
      revision: 1,
    })
    assert.deepEqual(computeMinorVersion({ version: 1, revision: 9 }), {
      version: 1,
      revision: 10,
    })
  })
})
