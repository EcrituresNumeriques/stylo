const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')

const { Query } = require('./searchResolver.js')
const Article = require('../models/article.js')
const Corpus = require('../models/corpus.js')
const User = require('../models/user.js')
const Workspace = require('../models/workspace.js')
const { createLoaders } = require('../loaders.js')
const { NotAuthenticatedError, NotFoundError } = require('../helpers/errors.js')
const { setup, teardown } = require('../tests/harness.js')

const search = (user, query, args) =>
  Query.search(
    null,
    { query, ...args },
    { user, token: { _id: user?.id }, loaders: createLoaders() }
  )

const createArticles = (owner, titles) =>
  Promise.all(titles.map((title) => Article.create({ title, owner })))

const createWorkspace = (members, articles = []) =>
  Workspace.create({
    name: 'Atelier',
    color: '#f4a261',
    members: members.map((user) => ({ user })),
    articles,
    creator: members[0],
  })

// identifiers of the results, in order
const ids = (results, key) =>
  results.map((result) => result[key]._id.toString())
const sorted = (documents) => documents.map(({ id }) => id).sort()

describe('search', () => {
  let container
  // each test searches its own words in these documents
  const fixtures = {}

  before(async () => {
    container = await setup()
    const user = await User.create({ email: 'search@huma-num.fr' })
    const other = await User.create({ email: 'search-other@huma-num.fr' })
    Object.assign(fixtures, { user, other })

    // title, Markdown content and metadata, stemmed: relier
    ;[fixtures.byTitle] = await createArticles(user, [
      'Livres reliés',
      'Atelier',
    ])
    fixtures.byContent = await Article.create({
      title: 'Atelier',
      owner: user,
      workingVersion: { md: '# Introduction\n\nDes manuscrits *reliés*.' },
    })
    fixtures.byMetadata = await Article.create({
      title: 'Atelier',
      owner: user,
      workingVersion: { metadata: { keywords: ['relier'] } },
    })

    // relevance: scriptorium enluminures
    ;[fixtures.oneWord] = await createArticles(user, ['Le scriptorium'])
    fixtures.bothWords = await Article.create({
      title: 'Le scriptorium',
      owner: user,
      workingVersion: { md: 'Les enluminures du scriptorium.' },
    })

    // corpora: codicologie
    fixtures.corpora = await Promise.all([
      Corpus.create({ name: 'Revue de codicologie', creator: user }),
      Corpus.create({
        name: 'Numéro 1',
        description: 'Codicologie',
        creator: user,
      }),
      Corpus.create({
        name: 'Numéro 2',
        metadata: { keywords: ['codicologie'] },
        creator: user,
      }),
    ])

    // document language: codex
    fixtures.english = await Article.create({
      title: 'Codex',
      owner: user,
      workingVersion: { metadata: { lang: 'en' } },
    })
    ;[fixtures.french] = await createArticles(user, ['Codex'])

    // access: glose
    ;[fixtures.owned] = await createArticles(user, ['Glose'])
    ;[fixtures.inWorkspace] = await createArticles(other, [
      'Glose de l’espace',
      'Glose privée',
    ])
    fixtures.shared = await Article.create({
      title: 'Glose partagée',
      owner: other,
      contributors: [{ user, roles: ['read', 'write'] }],
    })
    const shared = await createWorkspace(
      [user, other],
      [fixtures.owned, fixtures.inWorkspace]
    )
    fixtures.accessibleCorpora = await Promise.all([
      Corpus.create({ name: 'Glose', creator: user }),
      Corpus.create({
        name: 'Glose de l’espace',
        creator: other,
        workspace: shared,
      }),
    ])
    await Corpus.create({ name: 'Glose privée', creator: other })

    // workspace filter: marginalia
    ;[fixtures.workspaceArticle] = await createArticles(user, [
      'Marginalia',
      'Marginalia perso',
    ])
    fixtures.workspace = await createWorkspace(
      [user],
      [fixtures.workspaceArticle]
    )
    fixtures.workspaceCorpus = await Corpus.create({
      name: 'Marginalia',
      creator: user,
      workspace: fixtures.workspace,
    })
    await Corpus.create({ name: 'Marginalia perso', creator: user })
    fixtures.foreignWorkspace = await createWorkspace([other])

    // limit: incunable
    await createArticles(
      user,
      Array.from({ length: 21 }, (_, i) => `Incunable ${i}`)
    )
  })

  after(async () => {
    await teardown(container)
  })

  test('requires authentication', async () => {
    await assert.rejects(search(null, 'logos'), NotAuthenticatedError)
  })

  test('finds articles by title, Markdown content and metadata, stemmed', async () => {
    const { articles } = await search(fixtures.user, 'relier')
    assert.deepEqual(
      ids(articles, 'article').sort(),
      sorted([fixtures.byTitle, fixtures.byContent, fixtures.byMetadata])
    )
    assert.deepEqual(articles[0].article.owner._id, fixtures.user._id)
    assert.ok(articles[0].score > 0)
  })

  test('finds any of the words, the most relevant first', async () => {
    const { articles } = await search(fixtures.user, 'scriptorium enluminures')
    assert.deepEqual(ids(articles, 'article'), [
      fixtures.bothWords.id,
      fixtures.oneWord.id,
    ])
  })

  test('finds nothing', async () => {
    assert.deepEqual(await search(fixtures.user, 'palimpseste'), {
      articles: [],
      corpora: [],
    })
  })

  test('finds corpora by name, description and metadata', async () => {
    const { corpora } = await search(fixtures.user, 'codicologie')
    assert.deepEqual(ids(corpora, 'corpus').sort(), sorted(fixtures.corpora))
  })

  test('ranks the documents in the document language first', async () => {
    const inFrench = await search(fixtures.user, 'codex')
    assert.deepEqual(ids(inFrench.articles, 'article'), [
      fixtures.french.id,
      fixtures.english.id,
    ])
    const inEnglish = await search(fixtures.user, 'codex', {
      documentLanguage: 'en',
    })
    assert.deepEqual(ids(inEnglish.articles, 'article'), [
      fixtures.english.id,
      fixtures.french.id,
    ])
  })

  test('searches what the user has access to, once', async () => {
    const { articles, corpora } = await search(fixtures.user, 'glose')
    assert.deepEqual(
      ids(articles, 'article').sort(),
      sorted([fixtures.owned, fixtures.shared, fixtures.inWorkspace])
    )
    assert.deepEqual(
      ids(corpora, 'corpus').sort(),
      sorted(fixtures.accessibleCorpora)
    )
  })

  test('limits the search to a workspace', async () => {
    const { articles, corpora } = await search(fixtures.user, 'marginalia', {
      filter: { workspaceId: fixtures.workspace.id },
    })
    assert.deepEqual(ids(articles, 'article'), [fixtures.workspaceArticle.id])
    assert.deepEqual(ids(corpora, 'corpus'), [fixtures.workspaceCorpus.id])
  })

  test('refuses a workspace the user is not a member of', async () => {
    await assert.rejects(
      search(fixtures.user, 'marginalia', {
        filter: { workspaceId: fixtures.foreignWorkspace.id },
      }),
      NotFoundError
    )
  })

  test('returns at most 20 results by default', async () => {
    const { articles } = await search(fixtures.user, 'incunable')
    assert.equal(articles.length, 20)
  })

  test('returns at most limit results', async () => {
    const { articles } = await search(fixtures.user, 'incunable', { limit: 3 })
    assert.equal(articles.length, 3)
  })

  test('returns at most 20 results whatever the limit', async () => {
    const { articles } = await search(fixtures.user, 'incunable', {
      limit: 100000,
    })
    assert.equal(articles.length, 20)
  })
})
