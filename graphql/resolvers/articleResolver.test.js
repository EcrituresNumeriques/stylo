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

const { after, before, beforeEach, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

describe('article resolver', () => {
  let container
  let user2, user3, user4, user5, user6
  before(async () => {
    container = await setup()
    user2 = await User.create({
      email: 'test2@huma-num.fr',
    })
    user3 = await User.create({
      email: 'test3@huma-num.fr',
    })
    user4 = await User.create({
      email: 'test4@huma-num.fr',
    })
    user5 = await User.create({
      email: 'test5@huma-num.fr',
    })
    user6 = await User.create({
      email: 'test6@huma-num.fr',
    })
  })

  after(async () => {
    await teardown(container)
  })

  describe('workspaces', () => {
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
      assert.deepEqual(
        workspaces.map((w) => {
          const obj = w.toObject()
          return {
            name: obj.name,
          }
        }),
        [
          { name: 'Workspace A' },
          //  should not contain Workspace B because user is not invited in this workspace
          { name: 'Workspace C' },
        ]
      )
      const contextWithAdminUser = {
        user: { ...context.user },
        token: { admin: true },
      }
      workspaces = await ArticleResolver.workspaces(
        article,
        {},
        contextWithAdminUser
      )
      assert.deepEqual(
        workspaces.map((w) => {
          const obj = w.toObject()
          return {
            name: obj.name,
          }
        }),
        [
          { name: 'Workspace A' },
          { name: 'Workspace B' }, // admin user can see all workspaces that includes a given article
          { name: 'Workspace C' },
        ]
      )
    })
  })

  describe('articles', () => {
    let workspace
    const context = {
      user: {},
      userId: null,
      token: {},
      loaders: createLoaders(),
    }

    before(async () => {
      context.user = user2
      context.userId = user2._id
      context.token._id = user2._id

      const article = await Article.create({
        title: 'Article A',
        owner: [context.userId],
      })
      await Article.create({
        title: 'Article B',
        owner: [context.userId],
      })

      await Article.create({
        title: 'Article C',
        owner: [user6._id],
      })

      workspace = await Workspace.create({
        name: 'Workspace A',
        color: '#f4a261',
        members: [
          {
            user: context.userId,
          },
        ],
        articles: [article.id],
        creator: context.userId,
      })
    })

    test('refuses to list another user articles', async () => {
      await assert.rejects(
        async () => ArticleQuery.articles({}, { user: user3._id }, context),
        {
          name: 'Error',
          message: /^Forbidden/,
        }
      )
    })

    test('lists user articles', async () => {
      const articles = await ArticleQuery.articles({}, {}, context)

      // because sorting by last modified
      assert.deepEqual(
        articles.map((a) => a.title),
        ['Article B', 'Article A']
      )
    })

    test('list user articles for a given workspace', async () => {
      const filter = {
        workspaceId: workspace._id,
      }
      const articles = await ArticleQuery.articles({}, { filter }, context)

      // because sorting by last modified
      assert.deepEqual(
        articles.map((a) => a.title),
        ['Article A']
      )
    })
  })

  describe('duplicate article', () => {
    const context = {
      user: {},
      userId: null,
      token: {},
    }

    before(async () => {
      context.user = user4
      context.userId = user4._id
    })

    test('article is duplicated with its intrinsic values', async () => {
      const tag = await Tag.create({
        name: 'Test tag #1',
        owner: context.userId,
      })

      const article = await Article.create({
        title: 'My thesis',
        owner: [context.userId],
        contributors: [],
        versions: [],
        tags: [tag._id],
      })

      const duplicatedArticle = await ArticleMutation.duplicateArticle(
        {},
        { article: article._id, to: context.userId },
        context
      )

      assert.notEqual(duplicatedArticle._id.toString(), article._id.toString())
      assert.equal(duplicatedArticle.title, `[Copy] My thesis`)
      assert.equal(duplicatedArticle.tags[0]._id.toString(), tag._id.toString())
      // todo test other properties that should be duplicated
      // eg: owner, contributors, zoteroLink, workingVersion,

      // and others which should not
      // eg: versions
    })

    test('duplicated article is still linked to corpus and workspace', async () => {
      const article = await Article.create({
        title: 'My thesis',
        owner: [context.userId],
        contributors: [],
        versions: [],
        tags: [],
      })

      const corpus = await Corpus.create({
        name: 'Test Corpus #1',
        articles: [{ article: { _id: article._id }, order: 1 }],
        creator: context.user,
      })

      const workspace = await Workspace.create({
        color: '#bb69ff',
        name: 'Test Workspace #1',
        articles: [article._id],
        members: [{ user: context.userId }],
        creator: context.userId,
      })

      await ArticleMutation.duplicateArticle(
        {},
        { article: article._id, to: context.userId },
        context
      )

      const updatedCorpus = await Corpus.findById(corpus.id)
      const updatedWorkspace = await Workspace.findById(workspace.id)

      assert.equal(updatedCorpus.articles.length, 2)
      assert.equal(updatedWorkspace.articles.length, 2)
    })
  })

  describe('delete article', () => {
    const context = {
      user: {},
      userId: null,
      token: {},
    }

    beforeEach(async () => {
      context.user = user5
      context.userId = user5._id
    })

    test('article is deleted from versions, workspaces and corpus', async () => {
      const version = await Version.create({
        owner: context.userId,
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
        owner: [context.userId],
        contributors: [],
        versions: [version._id],
        tags: [],
      })

      const chapter1 = await Article.create({
        title: 'Chapter #1',
        owner: [context.userId],
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
        creator: context.user,
      })

      const workspace = await Workspace.create({
        color: '#bb69ff',
        name: 'Test Workspace #1',
        articles: [chapter1._id, chapter2._id],
        members: [{ user: context.userId }],
        creator: context.userId,
      })

      const removed = await ArticleResolver.delete(chapter2)
      assert.equal(removed, true)

      const workspaceAfter = await Workspace.findById(workspace._id)
        .lean()
        .exec()
      const corpusAfter = await Corpus.findById(corpus._id).lean().exec()
      const versionAfter = await Version.findById(version._id).exec()
      const chapter1After = await Article.findById(chapter1._id).exec()
      const chapter2After = await Article.findById(chapter2._id).exec()

      assert.deepEqual(workspaceAfter.articles, [chapter1._id])
      assert.deepEqual(
        corpusAfter.articles.map((a) => ({
          article: a.article,
          order: a.order,
        })),
        [{ article: chapter1._id, order: 1 }]
      )
      assert.equal(versionAfter, null)
      assert.equal(chapter1After._id.toString(), chapter1._id.toString())
      assert.equal(chapter2After, null)
    })
  })

  describe('update article bibliography', () => {
    const context = {
      user: {},
      userId: null,
      token: {},
    }

    before(async () => {
      context.user = user4
      context.userId = user4._id
    })

    test('updates bibliography on an owned article and returns parsed entries', async () => {
      const article = await Article.create({
        title: 'Article with bibliography',
        owner: [context.userId],
      })
      const bib =
        '@article{doe2024, title={A Great Paper}, author={Doe, John}, year={2024}}'

      const entries = await ArticleMutation.updateArticleBibliography(
        {},
        { input: { articleId: article._id, bib } },
        context
      )

      const updated = await Article.findById(article._id)
      assert.equal(updated.workingVersion.bib, bib)
      assert.ok(Array.isArray(entries))
      assert.ok(entries.length > 0)
    })

    test('replaces existing bibliography entirely', async () => {
      const article = await Article.create({
        title: 'Article with existing bibliography',
        owner: [context.userId],
        workingVersion: {
          bib: '@article{old2020, title={Old Paper}, author={Smith, Jane}, year={2020}}',
        },
      })
      const newBib =
        '@article{new2024, title={New Paper}, author={Doe, John}, year={2024}}'

      await ArticleMutation.updateArticleBibliography(
        {},
        { input: { articleId: article._id, bib: newBib } },
        context
      )

      const updated = await Article.findById(article._id)
      assert.equal(updated.workingVersion.bib, newBib)
    })

    test('rejects update on an article the user does not own', async () => {
      const article = await Article.create({
        title: 'Someone else article',
        owner: [user2._id],
      })

      await assert.rejects(async () =>
        ArticleMutation.updateArticleBibliography(
          {},
          { input: { articleId: article._id, bib: '@article{x}' } },
          context
        )
      )
    })

    test('rejects unauthenticated update', async () => {
      const article = await Article.create({
        title: 'Protected article',
        owner: [context.userId],
      })

      await assert.rejects(async () =>
        ArticleMutation.updateArticleBibliography(
          {},
          { input: { articleId: article._id, bib: '' } },
          { user: {}, userId: null, token: {} }
        )
      )
    })
  })

  describe('update article metadata', () => {
    const context = {
      user: {},
      userId: null,
      token: {},
    }

    before(async () => {
      context.user = user6
      context.userId = user6._id
    })

    test('updates metadata on an owned article', async () => {
      const article = await Article.create({
        title: 'Article with metadata',
        owner: [context.userId],
      })
      const metadata = {
        title: 'Updated title',
        author: [{ name: 'Doe, Jane' }],
      }

      const updated = await ArticleMutation.updateArticleMetadata(
        {},
        { input: { articleId: article._id, metadata } },
        context
      )

      assert.deepEqual(updated.workingVersion.metadata, metadata)
    })

    test('replaces existing metadata entirely', async () => {
      const article = await Article.create({
        title: 'Article with existing metadata',
        owner: [context.userId],
        workingVersion: { metadata: { title: 'Old title', lang: 'fr' } },
      })
      const newMetadata = { title: 'New title' }

      const updated = await ArticleMutation.updateArticleMetadata(
        {},
        { input: { articleId: article._id, metadata: newMetadata } },
        context
      )

      assert.deepEqual(updated.workingVersion.metadata, newMetadata)
    })

    test('rejects update on an article the user does not own', async () => {
      const article = await Article.create({
        title: 'Someone else article',
        owner: [user2._id],
      })

      await assert.rejects(async () =>
        ArticleMutation.updateArticleMetadata(
          {},
          { input: { articleId: article._id, metadata: { title: 'Hacked' } } },
          context
        )
      )
    })

    test('rejects unauthenticated update', async () => {
      const article = await Article.create({
        title: 'Protected article',
        owner: [context.userId],
      })

      await assert.rejects(async () =>
        ArticleMutation.updateArticleMetadata(
          {},
          { input: { articleId: article._id, metadata: {} } },
          { user: {}, userId: null, token: {} }
        )
      )
    })
  })

  describe('import article', () => {
    const context = {
      user: {},
      userId: null,
      token: {},
    }

    before(async () => {
      context.user = user3
      context.userId = user3._id
    })

    test('imports an article with only a title', async () => {
      const article = await ArticleMutation.importArticle(
        {},
        { input: { title: 'My imported article' } },
        context
      )

      assert.equal(article.title, 'My imported article')
      assert.equal(article.workingVersion.bib, '')
      assert.deepEqual(article.workingVersion.metadata, {})
    })

    test('imports an article with all fields', async () => {
      const bib = '@article{test2024, title={Test}}'
      const metadata = { title: 'My article', author: [{ name: 'Doe, John' }] }

      const article = await ArticleMutation.importArticle(
        {},
        {
          input: {
            title: 'My full article',
            content: '# Hello World',
            bibliography: bib,
            metadata,
          },
        },
        context
      )

      assert.equal(article.title, 'My full article')
      assert.equal(article.workingVersion.bib, bib)
      assert.deepEqual(article.workingVersion.metadata, metadata)
    })

    test('rejects unauthenticated import', async () => {
      await assert.rejects(async () =>
        ArticleMutation.importArticle(
          {},
          { input: { title: 'Unauthorized article' } },
          { user: {}, userId: null, token: {} }
        )
      )
    })
  })
})
