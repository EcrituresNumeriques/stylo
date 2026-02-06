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
