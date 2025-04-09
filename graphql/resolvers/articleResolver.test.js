const { ObjectId } = require('mongoose').Types
const {
  Article: ArticleResolver,
  Mutation: ArticleMutation,
} = require('./articleResolver')
const Workspace = require('../models/workspace')
const Article = require('../models/article')
const User = require('../models/user.js')
const Tag = require('../models/tag.js')
const Corpus = require('../models/corpus.js')

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
