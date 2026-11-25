const { describe, test } = require('node:test')
const assert = require('node:assert')
const { createAccess } = require('./accesses.js')

describe('createAccess', () => {
  const at = new Date('2026-11-21T09:00:00Z')

  test('truncates an IPv4 address to /24', () => {
    assert.deepEqual(
      createAccess({ ip: '192.168.1.42', strategy: 'local', at }),
      { at, ip: '192.168.1.0', strategy: 'local' }
    )
  })

  test('truncates an IPv4-mapped IPv6 address to /24', () => {
    assert.equal(
      createAccess({ ip: '::ffff:192.168.1.42', strategy: 'local' }).ip,
      '192.168.1.0'
    )
  })

  test('truncates an IPv6 address to /48', () => {
    assert.equal(
      createAccess({ ip: '2001:db8:abcd:12::1', strategy: 'local' }).ip,
      '2001:db8:abcd::'
    )
  })

  test('stores no address when none is given', () => {
    const access = createAccess({ strategy: 'zotero' })

    assert.equal(access.ip, null)
    assert.ok(access.at instanceof Date)
  })
})
