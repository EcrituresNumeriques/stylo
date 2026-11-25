const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const { setTimeout: sleep } = require('node:timers/promises')
const express = require('express')

const { loginRateLimit, createFailureLimiter } = require('./rateLimit.js')

// "bob" can log in with his username or his email
const accounts = {
  bob: { id: 'bob-id' },
  'bob@example.org': { id: 'bob-id' },
}

async function startServer(options) {
  const app = express()
  // lets the tests choose the client IP address
  app.set('trust proxy', 1)
  app.use(express.json())
  app.post(
    '/login',
    loginRateLimit({
      findAccount: async (identifier) => accounts[identifier] ?? null,
      ...options,
    }),
    (req, res) => {
      if (req.body.password === 'server-error') {
        return res.status(500).json({ ok: false })
      }
      const ok = req.body.password === 'right'
      res
        .status(ok ? 200 : 401)
        .json({ ok, account: req.loginAccount?.id ?? null })
    }
  )
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s))
  })
  const baseUrl = `http://127.0.0.1:${server.address().port}`
  const login = (username, password, ip) =>
    fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify({ username, password }),
    })
  return { server, login }
}

describe('loginRateLimit', () => {
  let server
  let login

  before(async () => {
    ;({ server, login } = await startServer({
      maxFailuresPerIp: 6,
      maxFailuresPerIdentifierAndIp: 2,
      maxFailuresPerIdentifier: 4,
    }))
  })

  after(() => {
    server.close()
  })

  test('does not count successful attempts', async () => {
    for (let i = 0; i < 4; i++) {
      assert.equal((await login('alice', 'right', '10.0.0.1')).status, 200)
    }
  })

  test('gives the account it found to the authentication', async () => {
    const response = await login('bob@example.org', 'right', '10.0.0.1')
    assert.equal((await response.json()).account, 'bob-id')
  })

  test('does not count server errors', async () => {
    for (let i = 0; i < 4; i++) {
      assert.equal((await login('bob', 'server-error', '10.0.0.9')).status, 500)
    }
    assert.equal((await login('bob', 'right', '10.0.0.9')).status, 200)
  })

  test('blocks an account from one IP address, whatever the identifier used', async () => {
    assert.equal((await login('bob', 'wrong', '10.0.0.2')).status, 401)
    assert.equal(
      (await login('bob@example.org', 'wrong', '10.0.0.2')).status,
      401
    )
    const response = await login('bob', 'right', '10.0.0.2')
    assert.equal(response.status, 429)
    assert.equal((await response.json()).error, 'TOO_MANY_ATTEMPTS')
  })

  test('does not lock the owner out when failures come from another IP address', async () => {
    assert.equal((await login('bob', 'right', '10.0.0.3')).status, 200)
  })

  test('blocks an account after too many failures from several IP addresses', async () => {
    // bob already has 2 failures from 10.0.0.2 (the 429 response is not counted)
    assert.equal((await login('bob', 'wrong', '10.0.0.4')).status, 401)
    assert.equal(
      (await login('bob@example.org', 'wrong', '10.0.0.4')).status,
      401
    )
    assert.equal((await login('bob', 'right', '10.0.0.5')).status, 429)
  })

  test('counts an unknown identifier whatever its case', async () => {
    assert.equal((await login('carol', 'wrong', '10.0.0.7')).status, 401)
    assert.equal((await login('Carol ', 'wrong', '10.0.0.7')).status, 401)
    assert.equal((await login('CAROL', 'wrong', '10.0.0.7')).status, 429)
  })

  test('blocks an IP address after too many failures on several identifiers', async () => {
    for (const username of [
      'dave',
      'erin',
      'frank',
      'grace',
      'heidi',
      'ivan',
    ]) {
      await login(username, 'wrong', '10.0.0.6')
    }
    assert.equal((await login('judy', 'right', '10.0.0.6')).status, 429)
  })
})

describe('loginRateLimit disabled', () => {
  let server
  let login

  before(async () => {
    ;({ server, login } = await startServer({
      enabled: false,
      maxFailuresPerIp: 1,
      maxFailuresPerIdentifierAndIp: 1,
      maxFailuresPerIdentifier: 1,
    }))
  })

  after(() => {
    server.close()
  })

  test('never blocks', async () => {
    for (let i = 0; i < 3; i++) {
      assert.equal((await login('bob', 'wrong', '10.0.0.8')).status, 401)
    }
    assert.equal((await login('bob', 'right', '10.0.0.8')).status, 200)
  })
})

describe('createFailureLimiter', () => {
  test('refuses attempts beyond the limit, until the window ends', async () => {
    const limiter = createFailureLimiter({ windowMs: 50, limit: 2 })
    assert.equal(await limiter.consume('a'), true)
    assert.equal(await limiter.consume('a'), true)
    assert.equal(await limiter.isBlocked('a'), true)
    assert.equal(await limiter.consume('a'), false)
    assert.equal(await limiter.consume('b'), true)
    await sleep(60)
    assert.equal(await limiter.isBlocked('a'), false)
    assert.equal(await limiter.consume('a'), true)
  })

  test('counts concurrent attempts', async () => {
    const limiter = createFailureLimiter({ limit: 3 })
    const results = await Promise.all(
      Array.from({ length: 10 }, () => limiter.consume('a'))
    )
    assert.equal(results.filter(Boolean).length, 3)
  })

  test('forgets the attempts of a key after a reset', async () => {
    const limiter = createFailureLimiter({ limit: 2 })
    await limiter.consume('a')
    await limiter.consume('a')
    await limiter.reset('a')
    assert.equal(await limiter.consume('a'), true)
  })

  test('never refuses when disabled', async () => {
    const limiter = createFailureLimiter({ enabled: false, limit: 1 })
    for (let i = 0; i < 3; i++) {
      assert.equal(await limiter.consume('a'), true)
    }
    assert.equal(await limiter.isBlocked('a'), false)
  })
})
