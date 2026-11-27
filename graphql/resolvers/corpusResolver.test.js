const { Query, Mutation, Corpus: CorpusMutation } = require('./corpusResolver')
const Corpus = require('../models/corpus')
const User = require('../models/user')
const Article = require('../models/article')
const Workspace = require('../models/workspace')
const { NotAuthenticatedError, NotFoundError } = require('../helpers/errors')
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

  describe('Corpus.workspaceId', () => {
    test('creates a corpus in a workspace with the workspaceId field', async () => {
      const user = await User.create({ email: 'workspace-id@huma-num.fr' })
      const workspace = await Workspace.create({
        name: 'Workspace',
        color: '#000000',
        members: [{ user: user._id }],
        creator: user._id,
      })

      const corpus = await Mutation.createCorpus(
        {},
        {
          input: {
            name: 'In a workspace',
            type: 'neutral',
            workspaceId: workspace.id,
          },
        },
        { user }
      )

      assert.equal(CorpusMutation.workspaceId(corpus), workspace.id)
    })

    test('still accepts the deprecated workspace field', async () => {
      const user = await User.create({ email: 'workspace@huma-num.fr' })
      const workspace = await Workspace.create({
        name: 'Workspace',
        color: '#000000',
        members: [{ user: user._id }],
        creator: user._id,
      })

      const corpus = await Mutation.createCorpus(
        {},
        {
          input: {
            name: 'Deprecated field',
            type: 'neutral',
            workspace: workspace.id,
          },
        },
        { user }
      )

      assert.equal(CorpusMutation.workspaceId(corpus), workspace.id)
    })

    test('is null for a personal corpus', async () => {
      const user = await User.create({ email: 'personal@huma-num.fr' })
      const corpus = await Mutation.createCorpus(
        {},
        { input: { name: 'Personal', type: 'neutral' } },
        { user }
      )

      assert.equal(CorpusMutation.workspaceId(corpus), null)
    })
  })

  describe('Mutation.updateCorpusArticlesOrder', () => {
    async function createCorpusWithArticles() {
      const user = await User.create({
        email: `order-${Date.now()}@huma-num.fr`,
      })
      const first = await Article.create({ title: 'First', owner: user.id })
      const second = await Article.create({ title: 'Second', owner: user.id })
      const corpus = await Corpus.create({
        name: 'Ordered corpus',
        creator: user.id,
        articles: [
          { article: first._id, order: 0 },
          { article: second._id, order: 1 },
        ],
      })
      return { user, corpus, first, second }
    }

    const orderOf = (corpus, article) =>
      corpus.articles.find((a) => a.article.equals(article._id)).order

    test('reorders the articles from the input argument', async () => {
      const { user, corpus, first, second } = await createCorpusWithArticles()

      const updated = await Mutation.updateCorpusArticlesOrder(
        {},
        {
          corpusId: corpus.id,
          input: {
            articles: [
              { articleId: second.id, order: 0 },
              { articleId: first.id, order: 1 },
            ],
          },
        },
        { user, userId: user.id, token: {} }
      )

      assert.equal(orderOf(updated, second), 0)
      assert.equal(orderOf(updated, first), 1)
    })

    test('still accepts the deprecated articlesOrderInput argument', async () => {
      const { user, corpus, first, second } = await createCorpusWithArticles()

      const updated = await Mutation.updateCorpusArticlesOrder(
        {},
        {
          corpusId: corpus.id,
          articlesOrderInput: [
            { articleId: second.id, order: 0 },
            { articleId: first.id, order: 1 },
          ],
        },
        { user, userId: user.id, token: {} }
      )

      assert.equal(orderOf(updated, second), 0)
    })

    test('requires the order of the articles', async () => {
      const { user, corpus } = await createCorpusWithArticles()

      await assert.rejects(
        () =>
          Mutation.updateCorpusArticlesOrder(
            {},
            { corpusId: corpus.id },
            { user, userId: user.id, token: {} }
          ),
        (error) => error.extensions.code === 'INVALID_INPUT'
      )
    })
  })

  describe('adding articles', () => {
    async function createCorpus(...titles) {
      const user = await User.create({
        email: `append-${Date.now()}-${Math.random()}@huma-num.fr`,
      })
      const articles = await Promise.all(
        titles.map((title) => Article.create({ title, owner: user.id }))
      )
      const corpus = await Corpus.create({ name: 'Corpus', creator: user.id })
      const context = { user, userId: user.id, token: {} }
      return { corpus, articles, context }
    }

    const setArticles = (corpus, articles, context) =>
      Mutation.setCorpusArticles(
        {},
        {
          corpusId: corpus.id,
          input: { articleIds: articles.map((a) => a.id) },
        },
        context
      )

    const orders = (corpus, articles) =>
      articles.map(
        (article) =>
          corpus.articles.find((a) => a.article.equals(article._id))?.order
      )

    test('appends the selected articles in the selection order, even after a reordering', async () => {
      const { corpus, articles, context } = await createCorpus(
        '1',
        '2',
        '3',
        '4',
        '5'
      )
      const [one, two, three, four, five] = articles
      const added = await setArticles(corpus, [two, one, three], context)
      assert.deepEqual(orders(added, [two, one, three]), [0, 1, 2])
      await Mutation.updateCorpusArticlesOrder(
        {},
        {
          corpusId: corpus.id,
          input: {
            articles: [
              { articleId: three.id, order: 0 },
              { articleId: one.id, order: 1 },
              { articleId: two.id, order: 2 },
            ],
          },
        },
        context
      )

      const updated = await setArticles(
        corpus,
        [one, two, three, five, four],
        context
      )

      assert.deepEqual(
        orders(updated, [three, one, two, five, four]),
        [0, 1, 2, 3, 4]
      )
    })

    test('removes the unselected articles', async () => {
      const { corpus, articles, context } = await createCorpus('1', '2')
      const [one, two] = articles
      await setArticles(corpus, [one, two], context)

      const updated = await setArticles(corpus, [two], context)

      assert.deepEqual(orders(updated, [one, two]), [undefined, 1])
    })

    test('appends an article added from the article page, once', async () => {
      const { corpus, articles, context } = await createCorpus('1', '2')
      const [one, two] = articles
      await setArticles(corpus, [one], context)
      const addFromArticlePage = (article) =>
        Mutation.addCorpusArticle(
          {},
          { corpusId: corpus.id, articleId: article.id },
          context
        )

      await addFromArticlePage(two)
      const updated = await addFromArticlePage(one)

      assert.deepEqual(orders(updated, [one, two]), [0, 1])
      assert.equal(updated.articles.length, 2)
    })

    test('appends after and sorts articles stored without order', async () => {
      const { corpus, articles } = await createCorpus('1', '2', '3', '4')
      const [one, two, three, four] = articles
      corpus.articles = [
        { article: one._id, order: 0 },
        { article: two._id, order: 1 },
        { article: three._id },
      ]
      await corpus.save()

      const updated = await corpus.addArticles([four.id])
      const context = {
        loaders: { articles: { load: async (_id) => ({ _id }) } },
      }
      const sorted = await CorpusMutation.articles(updated, {}, context)

      assert.deepEqual(orders(updated, [four]), [2])
      assert.deepEqual(
        sorted.map((a) => a.article._id.toString()),
        [one, three, two, four].map((a) => a.id)
      )
    })
  })

  test('list the personal corpora of the authenticated user', async () => {
    const alice = await User.create({ email: 'alice@huma-num.fr' })
    const bob = await User.create({ email: 'bob@huma-num.fr' })
    const workspace = await Workspace.create({
      name: 'Workspace A',
      color: '#bb69ff',
      members: [{ user: alice.id }],
      articles: [],
      creator: alice.id,
    })
    await Corpus.create({ name: 'Personal', creator: alice.id })
    await Corpus.create({
      name: 'In workspace',
      creator: alice.id,
      workspace: workspace.id,
    })
    await Corpus.create({ name: 'Not mine', creator: bob.id })

    const corpora = await Query.corpora(
      {},
      {},
      { user: alice, userId: alice.id }
    )
    assert.deepEqual(
      corpora.map((c) => c.name),
      ['Personal']
    )
  })

  test('list the corpora of a workspace', async () => {
    const alice = await User.create({ email: 'alice.w@huma-num.fr' })
    const bob = await User.create({ email: 'bob.w@huma-num.fr' })
    const workspace = await Workspace.create({
      name: 'Workspace B',
      color: '#bb69ff',
      members: [{ user: alice.id }, { user: bob.id }],
      articles: [],
      creator: alice.id,
    })
    await Corpus.create({
      name: 'Shared',
      creator: alice.id,
      workspace: workspace.id,
    })
    await Corpus.create({ name: 'Personal', creator: bob.id })

    const corpora = await Query.corpora(
      {},
      { filter: { workspaceId: workspace.id } },
      { user: bob, userId: bob.id }
    )
    assert.deepEqual(
      corpora.map((c) => c.name),
      ['Shared']
    )
  })

  test('refuse to list the corpora of a workspace the user is not a member of', async () => {
    const alice = await User.create({ email: 'alice.x@huma-num.fr' })
    const mallory = await User.create({ email: 'mallory@huma-num.fr' })
    const workspace = await Workspace.create({
      name: 'Workspace C',
      color: '#bb69ff',
      members: [{ user: alice.id }],
      articles: [],
      creator: alice.id,
    })

    await assert.rejects(
      Query.corpora(
        {},
        { filter: { workspaceId: workspace.id } },
        { user: mallory, userId: mallory.id }
      ),
      NotFoundError
    )
  })

  test('refuse to list personal corpora when not authenticated', async () => {
    await assert.rejects(Query.corpora({}, {}, {}), NotAuthenticatedError)
  })
})
