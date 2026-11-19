const { describe, test } = require('node:test')
const assert = require('node:assert')

const { withoutAuthorizationHeader } = require('./proxy.js')

describe('withoutAuthorizationHeader', () => {
  test('removes the Authorization header and keeps the others', () => {
    const proxyReqOpts = {
      method: 'GET',
      headers: {
        authorization: 'Bearer stylo-session-token',
        accept: 'application/json',
      },
    }

    assert.deepEqual(withoutAuthorizationHeader(proxyReqOpts), {
      method: 'GET',
      headers: { accept: 'application/json' },
    })
  })

  test('accepts options without headers', () => {
    assert.deepEqual(withoutAuthorizationHeader({ method: 'GET' }), {
      method: 'GET',
    })
  })
})
