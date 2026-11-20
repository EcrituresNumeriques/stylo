const { test } = require('node:test')
const assert = require('node:assert')

const { searchLanguage } = require('./search.js')

test('searchLanguage', () => {
  const cases = [
    [undefined, 'fr'],
    ['', 'fr'],
    ['en', 'en'],
    ['grc', 'none'],
  ]
  for (const [lang, expected] of cases) {
    assert.equal(searchLanguage(lang), expected, lang)
  }
})
