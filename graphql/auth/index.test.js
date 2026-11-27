const { resolveAllowedOrigin, stampAuth } = require('./index.js')
const config = require('../config.js')

const { before, describe, test } = require('node:test')
const assert = require('node:assert')

function createRequest(headers) {
  return {
    header(name) {
      return headers[name.toLowerCase()]
    },
    session: {},
  }
}

describe('resolveAllowedOrigin', () => {
  before(() => {
    config.set('security.cors.origin', 'http://stylo.example http://localhost:3000')
  })

  test('accepts an Origin header that matches the allow-list', () => {
    assert.strictEqual(
      resolveAllowedOrigin(createRequest({ origin: 'http://stylo.example' })),
      'http://stylo.example'
    )
  })

  test('accepts a Referer header that matches the allow-list', () => {
    assert.strictEqual(
      resolveAllowedOrigin(
        createRequest({ referer: 'http://localhost:3000/some/path' })
      ),
      'http://localhost:3000'
    )
  })

  test('rejects an attacker-controlled origin', () => {
    assert.strictEqual(
      resolveAllowedOrigin(
        createRequest({ referer: 'https://attacker.example/phish' })
      ),
      null
    )
  })

  test('rejects a missing Origin/Referer header', () => {
    assert.strictEqual(resolveAllowedOrigin(createRequest({})), null)
  })

  test('rejects a malformed header instead of throwing', () => {
    assert.strictEqual(
      resolveAllowedOrigin(createRequest({ referer: 'not-a-url' })),
      null
    )
  })
})

describe('stampAuth', () => {
  before(() => {
    config.set('security.cors.origin', 'http://stylo.example')
  })

  test('responds with 400 instead of calling next() for a disallowed origin', () => {
    const req = createRequest({ referer: 'https://attacker.example' })
    let statusCode
    const res = {
      status(code) {
        statusCode = code
        return this
      },
      send() {},
    }
    let nextCalled = false

    stampAuth('humanid')(req, res, () => {
      nextCalled = true
    })

    assert.strictEqual(statusCode, 400)
    assert.strictEqual(nextCalled, false)
    assert.strictEqual(req.session.origin, undefined)
  })

  test('stores the allowed origin on the session and calls next()', () => {
    const req = createRequest({ origin: 'http://stylo.example' })
    let nextCalled = false

    stampAuth('humanid')(req, {}, () => {
      nextCalled = true
    })

    assert.strictEqual(nextCalled, true)
    assert.strictEqual(req.session.origin, 'http://stylo.example')
  })
})
