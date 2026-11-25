const { describe, test } = require('node:test')
const assert = require('node:assert')
const { Writable } = require('node:stream')
const pino = require('pino')

const { redact } = require('./logger.js')

function log(object) {
  const lines = []
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      lines.push(JSON.parse(chunk.toString()))
      callback()
    },
  })
  pino({ redact }, stream).info(object)
  return lines[0]
}

describe('logger', () => {
  test('redacts credentials in request and response headers', () => {
    const line = log({
      req: {
        headers: {
          authorization: 'Bearer secret',
          cookie: 'stylo.session=secret',
          accept: 'application/json',
        },
      },
      res: { headers: { 'set-cookie': ['stylo.session=secret'] } },
    })
    assert.equal(line.req.headers.authorization, '[Redacted]')
    assert.equal(line.req.headers.cookie, '[Redacted]')
    assert.equal(line.req.headers.accept, 'application/json')
    assert.equal(line.res.headers['set-cookie'], '[Redacted]')
  })

  test('keeps the redirect location but removes the token, whatever its case', () => {
    const line = log({
      res: {
        headers: {
          location: 'https://stylo.example/login#Auth-Token=eyJhbGci.secret',
        },
      },
    })
    assert.equal(
      line.res.headers.location,
      'https://stylo.example/login#Auth-Token=[Filtered]'
    )
  })

  test('removes the OAuth credentials from the request URL and query', () => {
    const query = { oauth_token: 'secret', oauth_verifier: 'secret' }
    const line = log({
      req: {
        url: '/authorization-code/zotero/callback?oauth_token=secret&oauth_verifier=secret',
        query,
      },
    })
    assert.equal(
      line.req.url,
      '/authorization-code/zotero/callback?oauth_token=[Filtered]&oauth_verifier=[Filtered]'
    )
    assert.deepEqual(line.req.query, {
      oauth_token: '[Filtered]',
      oauth_verifier: '[Filtered]',
    })
    // the request itself is not modified
    assert.equal(query.oauth_token, 'secret')
  })

  test('removes the OAuth 2 code and state from the request URL and query', () => {
    const line = log({
      req: {
        url: '/authorization-code/callback?code=abc&state=xyz',
        query: { code: 'abc', state: 'xyz' },
      },
    })
    assert.equal(
      line.req.url,
      '/authorization-code/callback?code=[Filtered]&state=[Filtered]'
    )
    assert.deepEqual(line.req.query, {
      code: '[Filtered]',
      state: '[Filtered]',
    })
  })

  test('removes credentials from error messages', () => {
    const line = log({
      err: {
        message: 'failed GET /callback?oauth_verifier=secret',
        stack: 'Error: failed GET /callback?oauth_verifier=secret\n    at x',
      },
    })
    assert.equal(
      line.err.message,
      'failed GET /callback?oauth_verifier=[Filtered]'
    )
    assert.match(line.err.stack, /oauth_verifier=\[Filtered\]/)
  })
})
