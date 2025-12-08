const { Query, Corpus: CorpusMutation } = require('./corpusResolver')
const Corpus = require('../models/corpus')
const User = require('../models/user')
const Article = require('../models/article')
const { before, after, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness')

describe('corpus resolver', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  test('add an article to an existing corpus', async () => {
    const guillaume = await User.create({
      email: 'guillaume@huma-num.fr',
      firstName: 'Guillaume',
      lastName: 'Grossetie',
    })
    const corpus = await Corpus.create({
      name: 'Corpus A',
      articles: [],
      creator: guillaume.id,
    })
    const thesis = await Article.create({
      title: 'My Thesis',
      owner: guillaume.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    await CorpusMutation.addArticle(corpus, { articleId: thesis.id })
    const corpusList = await Query.corpus(
      {},
      {},
      { user: guillaume, userId: guillaume.id }
    )
    const firstCorpusFound = corpusList[0].toJSON()
    assert.equal(firstCorpusFound.name, 'Corpus A')
    assert.deepEqual(
      firstCorpusFound.articles.map((a) => a.article.toString()),
      [thesis._id.toString()]
    )
    assert.equal(
      firstCorpusFound.creator._id.toString(),
      guillaume._id.toString()
    )
  })

  test('remove an existing article', async () => {
    const clara = await User.create({
      email: 'clara@huma-num.fr',
      firstName: 'Clara',
    })
    const thesis = await Article.create({
      title: 'My Thesis',
      owner: clara.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const corpus = await Corpus.create({
      name: 'Corpus B',
      articles: [{ article: thesis, order: 1 }],
      creator: clara.id,
    })
    const corpusArticle = await CorpusMutation.article(corpus, {
      articleId: thesis.id,
    })
    await corpusArticle.remove()
    const corpusList = await Query.corpus(
      {},
      {},
      { user: clara, userId: clara.id }
    )

    const firstCorpusFound = corpusList[0].toJSON()
    assert.equal(firstCorpusFound.name, 'Corpus B')
    assert.deepEqual(firstCorpusFound.articles, [])
    assert.equal(firstCorpusFound.creator._id.toString(), clara._id.toString())
  })

  test('move an existing article', async () => {
    const thomas = await User.create({
      email: 'thomas@huma-num.fr',
      firstName: 'Thomas',
    })
    const chapter1 = await Article.create({
      title: 'Chapter #1',
      owner: thomas.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const chapter2 = await Article.create({
      title: 'Chapter #2',
      owner: thomas.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const chapter3 = await Article.create({
      title: 'Chapter #3',
      owner: thomas.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const chapter4 = await Article.create({
      title: 'Chapter #4',
      owner: thomas.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const corpus = await Corpus.create({
      name: 'Corpus C',
      articles: [
        { article: chapter2, order: 1 },
        { article: chapter3, order: 2 },
        { article: chapter1, order: 3 },
        { article: chapter4, order: 4 },
      ],
      creator: {
        _id: thomas.id,
      },
    })
    const corpusArticle = await CorpusMutation.article(corpus, {
      articleId: chapter1.id,
    })
    await corpusArticle.move(1)
    const corpusList = await Query.corpus(
      {},
      {},
      { user: thomas, userId: thomas.id }
    )

    const firstCorpusFound = corpusList[0].toJSON()
    assert.equal(firstCorpusFound.name, 'Corpus C')
    assert.deepEqual(
      firstCorpusFound.articles.map((a) => ({
        id: a.article.toString(),
        order: a.order,
      })),
      [
        {
          id: chapter2._id.toString(),
          order: 2,
        },
        {
          id: chapter3._id.toString(),
          order: 3,
        },
        {
          id: chapter1._id.toString(),
          order: 1,
        },
        {
          id: chapter4._id.toString(),
          order: 4,
        },
      ]
    )
    assert.equal(firstCorpusFound.creator._id.toString(), thomas._id.toString())
  })
})
