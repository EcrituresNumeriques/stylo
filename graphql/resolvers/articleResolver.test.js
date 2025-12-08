const { ObjectId } = require('mongoose').Types
const {
  Article: ArticleResolver,
  Query: ArticleQuery,
  Mutation: ArticleMutation,
} = require('./articleResolver')
const Workspace = require('../models/workspace')
const Article = require('../models/article')
const Version = require('../models/version')
const User = require('../models/user.js')
const Tag = require('../models/tag.js')
const Corpus = require('../models/corpus.js')
const { createLoaders } = require('../loaders.js')

describe('article resolver', () => {
  test('get workspaces', async () => {
    const userId = new ObjectId()
    const context = {
      user: {
        email: 'bob@huma-num.fr',
        id: userId.toString(),
        _id: userId._id,
      },
      token: {},
    }
    const article = await Article.create({
      title: 'My thesis',
      owner: [userId],
      contributors: [],
      versions: [],
      tags: [],
    })
    await Workspace.create({
      name: 'Workspace A',
      color: '#f4a261',
      members: [
        {
          user: new ObjectId(),
        },
        {
          user: new ObjectId(),
        },
        {
          user: userId,
        },
      ],
      articles: [article._id],
      creator: new ObjectId(),
    })
    await Workspace.create({
      name: 'Workspace B',
      color: '#e9c46a',
      members: [
        {
          user: new ObjectId(),
        },
      ],
      articles: [article._id],
      creator: new ObjectId(),
    })
    await Workspace.create({
      name: 'Workspace C',
      color: '#2a9d8f',
      members: [
        {
          user: userId,
        },
      ],
      articles: [article._id],
      creator: new ObjectId(),
    })
    let workspaces = await ArticleResolver.workspaces(article, {}, context)
    expect(workspaces.map((w) => w.toObject())).toMatchObject([
      { name: 'Workspace A' },
      //  should not contain Workspace B because user is not invited in this workspace
      { name: 'Workspace C' },
    ])
    const contextWithAdminUser = {
      user: { ...context.user },
      token: { admin: true },
    }
    workspaces = await ArticleResolver.workspaces(
      article,
      {},
      contextWithAdminUser
    )
    expect(workspaces.map((w) => w.toObject())).toMatchObject([
      { name: 'Workspace A' },
      { name: 'Workspace B' }, // admin user can see all workspaces that includes a given article
      { name: 'Workspace C' },
    ])
  })
})

describe('articles', () => {
  let user, user2, workspace
  const context = {
    user: {},
    userId: null,
    token: {},
    loaders: createLoaders(),
  }

  beforeEach(async () => {
    user = await User.create({
      email: 'test1@example.com',
    })

    user2 = await User.create({
      email: 'test2@example.com',
    })

    context.user = user
    context.userId = user._id
    context.token._id = user._id

    const article = await Article.create({
      title: 'Article A',
      owner: [user._id],
    })
    await Article.create({
      title: 'Article B',
      owner: [user._id],
    })

    await Article.create({
      title: 'Article C',
      owner: [user2.id],
    })

    workspace = await Workspace.create({
      name: 'Workspace A',
      color: '#f4a261',
      members: [
        {
          user: user.id,
        },
      ],
      articles: [article.id],
      creator: user.id,
    })
  })

  test('refuses to list another user articles', async () => {
    const articlesP = ArticleQuery.articles({}, { user: user2._id }, context)

    return expect(articlesP).rejects.toThrow('Forbidden')
  })

  test('lists user articles', async () => {
    const articles = await ArticleQuery.articles({}, {}, context)

    // because sorting by last modified
    expect(articles).toHaveProperty('0.title', 'Article B')
    expect(articles).toHaveProperty('1.title', 'Article A')
  })

  test('list user articles for a given workspace', async () => {
    const filter = {
      workspaceId: workspace._id,
    }
    const articles = await ArticleQuery.articles({}, { filter }, context)

    // because sorting by last modified
    expect(articles).toHaveLength(1)
    expect(articles).toHaveProperty('0.title', 'Article A')
  })
})

describe('duplicateArticle', () => {
  let user
  const context = {
    user: {},
    userId: null,
    token: {},
  }

  beforeEach(async () => {
    user = await User.create({
      email: 'bob@huma-num.fr',
    })

    context.user = user
    context.userId = user._id
  })

  test('article is duplicated with its intrinsic values', async () => {
    const tag = await Tag.create({
      name: 'Test tag #1',
      owner: user._id,
    })

    const article = await Article.create({
      title: 'My thesis',
      owner: [user._id],
      contributors: [],
      versions: [],
      tags: [tag._id],
    })

    const duplicatedArticle = await ArticleMutation.duplicateArticle(
      {},
      { article: article._id, to: user._id },
      context
    )

    expect(duplicatedArticle._id).not.toBe(article._id)
    expect(duplicatedArticle.title).toBe(`[Copy] My thesis`)
    expect(duplicatedArticle).toHaveProperty('tags.0._id', tag._id)
    // todo test other properties that should be duplicated
    // eg: owner, contributors, zoteroLink, workingVersion,

    // and others which should not
    // eg: versions
  })

  test('duplicated article is still linked to corpus and workspace', async () => {
    const article = await Article.create({
      title: 'My thesis',
      owner: [user._id],
      contributors: [],
      versions: [],
      tags: [],
    })

    const corpus = await Corpus.create({
      name: 'Test Corpus #1',
      articles: [{ article: { _id: article._id }, order: 1 }],
      creator: user,
    })

    const workspace = await Workspace.create({
      color: '#bb69ff',
      name: 'Test Workspace #1',
      articles: [article._id],
      members: [{ user: user._id }],
      creator: user._id,
    })

    await ArticleMutation.duplicateArticle(
      {},
      { article: article._id, to: user._id },
      context
    )

    const updatedCorpus = await Corpus.findById(corpus.id)
    const updatedWorkspace = await Workspace.findById(workspace.id)

    expect(updatedCorpus.articles).toHaveLength(2)
    expect(updatedWorkspace.articles).toHaveLength(2)
  })
})

describe('deleteArticle', () => {
  let user
  const context = {
    user: {},
    userId: null,
    token: {},
  }

  beforeEach(async () => {
    user = await User.create({
      email: 'bob@huma-num.fr',
    })

    context.user = user
    context.userId = user._id
  })

  test('article is deleted from versions, workspaces and corpus', async () => {
    const version = await Version.create({
      owner: user._id,
      title: 'v1.0',
      version: 1,
      revision: 0,
      message: 'Fix a few typos',
      md: '# Hello World',
      yaml: '',
      metadata: {},
      bib: '',
    })

    const chapter2 = await Article.create({
      title: 'Chapter #2',
      owner: [user._id],
      contributors: [],
      versions: [version._id],
      tags: [],
    })

    const chapter1 = await Article.create({
      title: 'Chapter #1',
      owner: [user._id],
      contributors: [],
      versions: [],
      tags: [],
    })

    const corpus = await Corpus.create({
      name: 'Test Corpus #1',
      articles: [
        { article: { _id: chapter1._id }, order: 1 },
        { article: { _id: chapter2._id }, order: 2 },
      ],
      creator: user,
    })

    const workspace = await Workspace.create({
      color: '#bb69ff',
      name: 'Test Workspace #1',
      articles: [chapter1._id, chapter2._id],
      members: [{ user: user._id }],
      creator: user._id,
    })

    const removed = await ArticleResolver.delete(chapter2)
    expect(removed).toBe(true)

    const workspaceAfter = await Workspace.findById(workspace._id).lean().exec()
    const corpusAfter = await Corpus.findById(corpus._id).lean().exec()
    const versionAfter = await Version.findById(version._id).exec()
    const chapter1After = await Article.findById(chapter1._id).exec()
    const chapter2After = await Article.findById(chapter2._id).exec()

    expect(workspaceAfter.articles).toEqual([chapter1._id])
    expect(
      corpusAfter.articles.map((a) => ({ article: a.article, order: a.order }))
    ).toEqual([{ article: chapter1._id, order: 1 }])
    expect(versionAfter).toBeNull()
    expect(chapter1After._id).toEqual(chapter1._id)
    expect(chapter2After).toBeNull()
  })
})
