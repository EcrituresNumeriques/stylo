const { computeMajorVersion, computeMinorVersion } = require('./versions.js')

describe('computeVersion', () => {
  test('computeMajorVersion', () => {
    expect(computeMajorVersion(undefined)).toEqual({ version: 1, revision: 0 })
    expect(computeMajorVersion({ version: 0, revision: 0 })).toEqual({
      version: 1,
      revision: 0,
    })
    expect(computeMajorVersion({ version: 1, revision: 0 })).toEqual({
      version: 2,
      revision: 0,
    })
    expect(computeMajorVersion({ version: 1, revision: 9 })).toEqual({
      version: 2,
      revision: 0,
    })
  })

  test('computeMinorVersion', () => {
    expect(computeMinorVersion(undefined)).toEqual({ version: 0, revision: 1 })
    expect(computeMinorVersion({ version: 0, revision: 0 })).toEqual({
      version: 0,
      revision: 1,
    })
    expect(computeMinorVersion({ version: 1, revision: 0 })).toEqual({
      version: 1,
      revision: 1,
    })
    expect(computeMinorVersion({ version: 1, revision: 9 })).toEqual({
      version: 1,
      revision: 10,
    })
  })
})
