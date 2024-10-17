const { Query, Corpus: CorpusMutation } = require('./corpusResolver')
const Corpus = require('../models/corpus')
const User = require('../models/user')
const Article = require('../models/article')

describe('corpus resolver', () => {
  test('add an article to an existing corpus', async () => {
    const guillaume = await User.create({
      email: 'guillaume@huma-num.fr',
      firstName: 'Guillaume',
      lastName: 'Grossetie'
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
    const corpusList = await Query.corpus({}, {}, { user: guillaume })
    expect(corpusList[0].toJSON()).toMatchObject({
        name: 'Corpus A',
        articles: [
          { article: thesis._id }
        ],
        creator: {
          _id: guillaume._id
        },
      },
    )
  })
  test('remove an existing article', async () => {
    const guillaume = await User.create({
      email: 'guillaume@huma-num.fr',
      firstName: 'Guillaume',
      lastName: 'Grossetie'
    })
    const thesis = await Article.create({
      title: 'My Thesis',
      owner: guillaume.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const corpus = await Corpus.create({
      name: 'Corpus B',
      articles: [{ article: thesis, order: 1 }],
      creator: guillaume.id,
    })
    const corpusArticle = await CorpusMutation.article(corpus, { articleId: thesis.id })
    await corpusArticle.remove()
    const corpusList = await Query.corpus({}, {}, { user: guillaume })
    expect(corpusList[0].toJSON()).toMatchObject({
        name: 'Corpus B',
        articles: [],
        creator: {
          _id: guillaume._id
        },
      },
    )
  })
  test('move an existing article', async () => {
    const guillaume = await User.create({
      email: 'guillaume@huma-num.fr',
      firstName: 'Guillaume',
      lastName: 'Grossetie'
    })
    const chapter1 = await Article.create({
      title: 'Chapter #1',
      owner: guillaume.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const chapter2 = await Article.create({
      title: 'Chapter #2',
      owner: guillaume.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const chapter3 = await Article.create({
      title: 'Chapter #3',
      owner: guillaume.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const chapter4 = await Article.create({
      title: 'Chapter #4',
      owner: guillaume.id,
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
        _id: guillaume.id
      },
    })
    const corpusArticle = await CorpusMutation.article(corpus, { articleId: chapter1.id })
    await corpusArticle.move(1)
    const corpusList = await Query.corpus({}, {}, { user: guillaume })
    expect(corpusList[0].toJSON()).toMatchObject({
        name: 'Corpus C',
        articles: [
          { article: chapter2._id, order: 2 },
          { article: chapter3._id, order: 3 },
          { article: chapter1._id, order: 1 },
          { article: chapter4._id, order: 4 },
        ],
        creator: {
          _id: guillaume._id
        },
      },
    )
  })
})
