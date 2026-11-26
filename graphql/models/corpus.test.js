const Corpus = require('./corpus.js')

const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

describe('searchLanguage', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  test('is computed when a corpus is saved', async () => {
    const corpus = await Corpus.create({
      name: 'Langue',
      metadata: { lang: 'en' },
    })
    assert.equal((await Corpus.findById(corpus.id)).searchLanguage, 'en')
  })

  test('is computed when a corpus metadata is updated', async () => {
    const corpus = await Corpus.create({ name: 'Langue' })
    await Corpus.findOneAndUpdate(
      { _id: corpus.id },
      { metadata: { lang: 'grc' } }
    )
    assert.equal((await Corpus.findById(corpus.id)).searchLanguage, 'none')
  })
})
