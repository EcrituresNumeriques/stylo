const { describe, test } = require('node:test')
const assert = require('node:assert')

const { scrubEvent } = require('./sentry.js')

describe('scrubEvent', () => {
  test('removes credentials from the request headers, cookies and URL', () => {
    const event = scrubEvent({
      request: {
        url: 'https://stylo.example/authorization-code/callback?code=abc&state=xyz&lang=fr',
        headers: {
          Authorization: 'Bearer secret',
          cookie: 'stylo.session=secret',
          accept: 'application/json',
        },
        cookies: { 'stylo.session': 'secret' },
        query_string: 'oauth_token=secret&oauth_verifier=secret&articleId=abc',
      },
    })
    assert.deepEqual(event.request, {
      url: 'https://stylo.example/authorization-code/callback?code=[Filtered]&state=[Filtered]&lang=fr',
      headers: {
        Authorization: '[Filtered]',
        cookie: '[Filtered]',
        accept: 'application/json',
      },
      cookies: {},
      query_string:
        'oauth_token=[Filtered]&oauth_verifier=[Filtered]&articleId=abc',
    })
  })

  test('removes the password from the login body', () => {
    const event = scrubEvent({
      request: { data: { username: 'alice', password: 's$cret' } },
    })
    assert.deepEqual(event.request.data, {
      username: 'alice',
      password: '[Filtered]',
    })
  })

  test('removes the passwords from the GraphQL variables and query', () => {
    const event = scrubEvent({
      request: {
        data: JSON.stringify({
          query:
            'mutation { changePassword(input: { currentPassword: "old", newPassword: "new" }) { id } }',
          variables: { input: { currentPassword: 'old', newPassword: 'new' } },
        }),
      },
    })
    const data = JSON.parse(event.request.data)
    assert.equal(
      data.query,
      'mutation { changePassword(input: { currentPassword: "[Filtered]", newPassword: "[Filtered]" }) { id } }'
    )
    assert.deepEqual(data.variables, {
      input: { currentPassword: '[Filtered]', newPassword: '[Filtered]' },
    })
  })

  test('removes sensitive local variables, even nested', () => {
    const event = scrubEvent({
      exception: {
        values: [
          {
            stacktrace: {
              frames: [
                {
                  vars: {
                    password: 's$cret',
                    jwtToken: 'eyJ…',
                    args: {
                      input: { currentPassword: 'a', newPassword: 'b' },
                      old: 'a',
                      new: 'b',
                    },
                    articleId: 'abc',
                  },
                },
              ],
            },
          },
        ],
      },
    })
    assert.deepEqual(event.exception.values[0].stacktrace.frames[0].vars, {
      password: '[Filtered]',
      jwtToken: '[Filtered]',
      args: {
        input: { currentPassword: '[Filtered]', newPassword: '[Filtered]' },
        old: '[Filtered]',
        new: '[Filtered]',
      },
      articleId: 'abc',
    })
  })

  test('removes credentials from breadcrumbs and spans', () => {
    const event = scrubEvent({
      breadcrumbs: [
        {
          message: 'GET /ws/abc?token=secret',
          data: {
            url: 'https://api.zotero.org/keys/x?key=1&access_token=secret',
          },
        },
      ],
      spans: [
        {
          description:
            'GET /authorization-code/zotero/callback?oauth_verifier=secret',
          data: { 'http.url': 'https://stylo.example/?code=secret' },
        },
      ],
    })
    assert.equal(event.breadcrumbs[0].message, 'GET /ws/abc?token=[Filtered]')
    assert.equal(
      event.breadcrumbs[0].data.url,
      'https://api.zotero.org/keys/x?key=1&access_token=[Filtered]'
    )
    assert.equal(
      event.spans[0].description,
      'GET /authorization-code/zotero/callback?oauth_verifier=[Filtered]'
    )
    assert.equal(
      event.spans[0].data['http.url'],
      'https://stylo.example/?code=[Filtered]'
    )
  })

  test('removes the deprecated changePassword arguments and other literal forms', () => {
    const event = scrubEvent({
      request: {
        data: JSON.stringify({
          query:
            'mutation { changePassword(old: "hunter2", new: "hunter3") { id } }',
        }),
      },
      extra: {
        blockString: 'mutation { login(password: """abc""") }',
        encodedTwice: '{\\"password\\":\\"x\\"}',
      },
    })
    assert.equal(
      JSON.parse(event.request.data).query,
      'mutation { changePassword(old: "[Filtered]", new: "[Filtered]") { id } }'
    )
    assert.equal(
      event.extra.blockString,
      'mutation { login(password: "[Filtered]") }'
    )
    assert.equal(event.extra.encodedTwice, '{\\"password\\":\\"[Filtered]\\"}')
  })

  test('removes credentials from messages and exceptions', () => {
    const event = scrubEvent({
      message: 'Authorization: Bearer abc.def-ghi',
      logentry: { message: 'redirect to /login#auth-token=eyJa.eyJb.c' },
      exception: {
        values: [{ value: 'Failed to fetch /callback?code=abc&state=xyz' }],
      },
      request: { query_string: { code: 'abc', state: 'xyz', lang: 'fr' } },
    })
    assert.equal(event.message, 'Authorization: Bearer [Filtered]')
    assert.equal(
      event.logentry.message,
      'redirect to /login#auth-token=[Filtered]'
    )
    assert.equal(
      event.exception.values[0].value,
      'Failed to fetch /callback?code=[Filtered]&state=[Filtered]'
    )
    assert.deepEqual(event.request.query_string, {
      code: '[Filtered]',
      state: '[Filtered]',
      lang: 'fr',
    })
  })

  test('keeps error codes', () => {
    const event = scrubEvent({ extra: { code: 'NOT_FOUND', state: 'open' } })
    assert.deepEqual(event.extra, { code: 'NOT_FOUND', state: 'open' })
  })

  test('accepts an event without request nor exception', () => {
    assert.deepEqual(scrubEvent({ message: 'hello' }), { message: 'hello' })
  })
})
