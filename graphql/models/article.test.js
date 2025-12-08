const Article = require('./article.js')
const Corpus = require('./corpus.js')
const User = require('./user.js')
const Version = require('./version.js')
const Workspace = require('./workspace.js')

describe('remove', () => {
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
    await chapter1.remove()

    // then...
    // chapter 1 must be removed from workspace
    const w = await Workspace.findOne({ _id: workspace.id })
    expect(w.articles).toHaveLength(1)
    expect(w.articles[0].toString()).toStrictEqual(chapter2.id) // chapter 2 _must not_ be removed

    // chapter 1 must be removed from corpus
    const c = await Corpus.findOne({ _id: corpus.id })
    expect(c.articles).toHaveLength(1)
    expect(c.articles[0].article.toString()).toStrictEqual(chapter2.id) // chapter 2 _must not_ be removed

    // chapter 1 version must be removed
    const chapter1Version = await Version.findById(chapter1VersionId)
    expect(chapter1Version).toBeNull()

    // chapter 2 version _must not_ be removed
    const chapter2Version = await Version.findById(chapter2VersionId)
    expect(chapter2Version).not.toBeNull()
  })
})
