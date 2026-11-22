const { registrationUrl } = require('./redirect.js')

const { describe, test } = require('node:test')
const assert = require('node:assert')

describe('registrationUrl', () => {
  test('encodes the name', () => {
    assert.equal(
      registrationUrl('https://stylo.huma-num.fr', 'humanid', 'Hélène Dupré'),
      'https://stylo.huma-num.fr/register/humanid?name=H%C3%A9l%C3%A8ne+Dupr%C3%A9'
    )
  })

  test('decodes back to the original name', () => {
    const url = new URL(
      registrationUrl('https://stylo.huma-num.fr', 'zotero', 'a&b=c #d')
    )
    assert.equal(url.searchParams.get('name'), 'a&b=c #d')
  })

  test('omits the name when there is none', () => {
    assert.equal(
      registrationUrl('https://stylo.huma-num.fr', 'hypothesis', undefined),
      'https://stylo.huma-num.fr/register/hypothesis'
    )
  })
})
