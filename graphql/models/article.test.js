const Article = require('./article.js')
const Corpus = require('./corpus.js')
const User = require('./user.js')
const Version = require('./version.js')
const Workspace = require('./workspace.js')

const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

describe('remove', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  test('remove article', async () => {
    // given
    const user = await User.create({
      email: 'a@example.com',
    })
    const chapter1 = await Article.create({
      title: 'Chapter 1',
      owner: user.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const chapter1VersionId = await chapter1.createNewVersion({
      mode: 'MAJOR',
      user: user,
    })
    const chapter2 = await Article.create({
      title: 'Chapter 2',
      owner: user.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const chapter2VersionId = await chapter2.createNewVersion({
      mode: 'MAJOR',
      user: user,
    })
    const corpus = await Corpus.create({
      name: 'Thesis',
      articles: [
        {
          article: chapter1.id,
          order: 1,
        },
        {
          article: chapter2.id,
          order: 1,
        },
      ],
      creator: user.id,
    })
    const workspace = await Workspace.create({
      name: 'Workspace',
      color: '#bb69ff',
      members: [{ user: user.id }],
      articles: [chapter1.id, chapter2.id],
      creator: user.id,
    })

    // when
    await chapter1.deleteOne()

    // then...
    // chapter 1 must be removed from workspace
    const w = await Workspace.findOne({ _id: workspace.id })
    assert.strictEqual(w.articles.length, 1)
    assert.strictEqual(w.articles[0].toString(), chapter2.id) // chapter 2 _must not_ be removed

    // chapter 1 must be removed from corpus
    const c = await Corpus.findOne({ _id: corpus.id })
    assert.strictEqual(c.articles.length, 1)
    assert.strictEqual(c.articles[0].article.toString(), chapter2.id) // chapter 2 _must not_ be removed

    // chapter 1 version must be removed
    const chapter1Version = await Version.findById(chapter1VersionId)
    assert.strictEqual(chapter1Version, null)

    // chapter 2 version _must not_ be removed
    const chapter2Version = await Version.findById(chapter2VersionId)
    assert.notStrictEqual(chapter2Version, null)
  })
})

describe('searchLanguage', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  test('is computed when an article is saved', async () => {
    const article = await Article.create({
      title: 'Langue',
      workingVersion: { metadata: { lang: 'en' } },
    })
    assert.equal((await Article.findById(article.id)).searchLanguage, 'en')
  })

  test('is computed when an article language is updated', async () => {
    const article = await Article.create({ title: 'Langue' })
    await Article.updateOne(
      { _id: article.id },
      { $set: { 'workingVersion.metadata.lang': 'en' } }
    )
    assert.equal((await Article.findById(article.id)).searchLanguage, 'en')
  })

  test('is left as is by an update of another field', async () => {
    const article = await Article.create({
      title: 'Langue',
      workingVersion: { metadata: { lang: 'en' } },
    })
    await Article.updateOne({ _id: article.id }, { title: 'Language' })
    assert.equal((await Article.findById(article.id)).searchLanguage, 'en')
  })
})

describe('shareWith', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  test('dates a new contributor', async () => {
    const owner = await User.create({ email: 'share-owner@example.com' })
    const contributor = await User.create({ email: 'share-with@example.com' })
    const article = await Article.create({ title: 'Shared', owner: owner.id })
    const before = new Date()

    await article.shareWith(contributor._id)

    const { addedAt } = article.contributors[0]
    assert.ok(addedAt >= before && addedAt <= new Date())
  })

  test('keeps the date when sharing again', async () => {
    const addedAt = new Date('2026-01-01')
    const contributor = await User.create({ email: 'share-again@example.com' })
    const article = await Article.create({
      title: 'Shared again',
      contributors: [{ user: contributor._id, addedAt }],
    })

    await article.shareWith(contributor._id)

    assert.equal(article.contributors.length, 1)
    assert.deepEqual(article.contributors[0].addedAt, addedAt)
  })

  test('does not date an existing contributor on save', async () => {
    const contributor = await User.create({ email: 'share-legacy@example.com' })
    const { insertedId } = await Article.collection.insertOne({
      title: 'Legacy',
      contributors: [{ user: contributor._id, roles: ['read', 'write'] }],
    })

    const article = await Article.findById(insertedId)
    article.title = 'Legacy, renamed'
    await article.save()

    const { contributors } = await Article.collection.findOne({
      _id: insertedId,
    })
    assert.equal(contributors[0].addedAt, undefined)
  })
})
