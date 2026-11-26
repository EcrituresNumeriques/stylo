const Article = require('./article.js')
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

describe('addArticles', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  test('dates a new article', async () => {
    const article = await Article.create({ title: 'Chapter' })
    const corpus = await Corpus.create({ name: 'Corpus' })
    const before = new Date()

    await corpus.addArticles([article.id])

    const { addedAt } = corpus.articles[0]
    assert.ok(addedAt >= before && addedAt <= new Date())
  })

  test('keeps the date when adding again', async () => {
    const addedAt = new Date('2026-01-01')
    const article = await Article.create({ title: 'Chapter again' })
    const corpus = await Corpus.create({
      name: 'Corpus again',
      articles: [{ article: article._id, addedAt }],
    })

    await corpus.addArticles([article.id])

    assert.equal(corpus.articles.length, 1)
    assert.deepEqual(corpus.articles[0].addedAt, addedAt)
  })
})

describe('updateArticlesOrder', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  test('keeps the date when reordering', async () => {
    const addedAt = new Date('2026-01-01')
    const article = await Article.create({ title: 'Chapter' })
    const corpus = await Corpus.create({
      name: 'Corpus',
      articles: [{ article: article._id, order: 0, addedAt }],
    })

    await corpus.updateArticlesOrder([{ articleId: article.id, order: 3 }])

    const [entry] = (await Corpus.findById(corpus.id)).articles
    assert.equal(entry.order, 3)
    assert.deepEqual(entry.addedAt, addedAt)
  })
})
