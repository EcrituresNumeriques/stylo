import assert from 'node:assert'
import { after, before, describe, test } from 'node:test'
import config from '../config.js'
import User from '../models/user.js'
import { setup, teardown } from '../tests/harness.js'
import { onSuccess } from './local.js'

describe('local authentication', () => {
  let container
  before(async () => {
    container = await setup()
    config.set('security.jwt.secret', 'test-secret')
  })

  after(async () => {
    await teardown(container)
  })

  test('only returns the public profile of the user', async () => {
    const user = await User.create({
      email: 'local-login@huma-num.fr',
      username: 'local-login',
      password: 'p4ssw0rd',
      authProviders: { zotero: { id: 'zotero-id', token: 'zotero-token' } },
    })
    const res = {
      json(body) {
        this.body = body
      },
    }

    await onSuccess({ user }, res)

    assert.equal(res.statusCode, 200)
    assert.ok(res.body.token)
    assert.equal(res.body.user.id, user.id)
    assert.equal(res.body.user.username, 'local-login')
    assert.equal(res.body.user._id, undefined)
    assert.equal(res.body.user.password, undefined)
    assert.equal(res.body.user.authProviders, undefined)
  })
})
