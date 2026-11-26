const { test } = require('node:test')
const assert = require('node:assert')

const { resultsLimit, searchLanguage, updatedValue } = require('./search.js')

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

test('resultsLimit', () => {
  const cases = [
    [undefined, 20],
    [null, 20],
    [0, 20],
    [-5, 20],
    [3, 3],
    [20, 20],
    [100000, 20],
  ]
  for (const [limit, expected] of cases) {
    assert.equal(resultsLimit(limit), expected, String(limit))
  }
})

test('updatedValue', () => {
  const path = 'workingVersion.metadata.lang'
  const cases = [
    [{ $set: { [path]: 'en' } }, { value: 'en' }],
    [{ [path]: 'en' }, { value: 'en' }],
    [{ $set: { 'workingVersion.metadata': { lang: 'en' } } }, { value: 'en' }],
    [{ $set: { workingVersion: { metadata: {} } } }, { value: undefined }],
    [{ $unset: { [path]: '' } }, { value: undefined }],
    [{ $set: { 'workingVersion.md': '# Titre' } }, undefined],
    [{ $set: { 'workingVersion.metadata.langue': 'en' } }, undefined],
    [{ $inc: { __v: 1 } }, undefined],
  ]
  for (const [update, expected] of cases) {
    assert.deepEqual(
      updatedValue(update, path),
      expected,
      JSON.stringify(update)
    )
  }
})
