const { test } = require('node:test')
const assert = require('node:assert')

const { toYaml, formatMetadata } = require('./yaml.js')

test('toYaml returns an empty string when there is no metadata', () => {
  assert.equal(toYaml({}), '')
  assert.equal(toYaml(''), '')
  assert.equal(toYaml(null), '')
  assert.equal(toYaml(undefined), '')
})

test('toYaml removes empty properties and sorts keys', () => {
  const result = toYaml({
    title: 'Stylo',
    description: undefined,
    abstract: '',
    authors: [],
    funder: {},
    subtitle: null,
    keywords: ['édition', 'bac-à-sable'],
    '@version': '1.0',
  })

  assert.equal(
    result,
    `---
'@version': '1.0'
keywords:
  - édition
  - bac-à-sable
title: Stylo
---`
  )
})

test('formatMetadata returns the metadata unchanged by default', () => {
  const metadata = { title: 'Stylo' }
  assert.equal(formatMetadata(metadata), metadata)
  assert.equal(formatMetadata(metadata, 'json'), metadata)
})

test('formatMetadata returns a YAML metadata block with the yaml format', () => {
  assert.equal(
    formatMetadata({ title: 'Stylo' }, 'yaml'),
    `---
title: Stylo
---`
  )
})
