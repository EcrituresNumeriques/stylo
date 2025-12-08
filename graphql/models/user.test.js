const Article = require('./article.js')
const Corpus = require('./corpus.js')
const Tag = require('./tag.js')
const User = require('./user.js')
const Version = require('./version.js')
const Workspace = require('./workspace.js')

const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

describe('user model', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  describe('getAuthProvidersCount', () => {
    test('returns 0 when value is missing', async () => {
      const user = new User({})

      assert.equal(user.getAuthProvidersCount(), 0)
    })

    test('returns 1 with one service', async () => {
      const user = new User({
        authProviders: {
          zotero: {
            id: '1234',
            token: 'abcd',
          },
        },
      })

      assert.equal(user.getAuthProvidersCount(), 1)
    })

    test('returns 2 with one configured service and one unset', async () => {
      const user = new User({
        authProviders: {
          humanid: null,
          hypothesis: {
            id: 'abdc-efgh',
          },
          zotero: {
            id: '1234',
            token: 'abcd',
          },
        },
      })

      assert.equal(user.getAuthProvidersCount(), 2)
    })
  })

  describe('softDelete', () => {
    let userA, userB

    before(async () => {
      // given
      userA = await User.create({
        email: 'a@example.com',
      })

      userB = await User.create({
        email: 'b@example.com',
      })

      const ta1 = await Tag.create({
        name: 'User A tag #1',
        owner: userA,
      })
      const ta2 = await Tag.create({
        name: 'User A tag #2',
        owner: userA,
      })
      const tb1 = await Tag.create({
        name: 'User B tag',
        owner: userB,
      })

      const articleA = await Article.create({
        title: 'User A article #1',
        owner: userA,
        tags: [ta1, ta2],
      })

      await articleA.createNewVersion({
        mode: 'MAJOR',
        message: 'User A article #1 version 1.1',
        user: userB,
      })

      const articleB = await Article.create({
        title: 'User B article #1',
        owner: userB,
        tags: [tb1],
        contributors: [{ user: userA, role: ['read', 'write'] }],
      })

      await articleB.createNewVersion({
        mode: 'MAJOR',
        message: 'User B article #1 version 2.0 (made by user A)',
        user: userA,
      })

      await articleB.createNewVersion({
        mode: 'MINOR',
        message: 'User B article #1 version 2.1',
        user: userB,
      })

      const w1 = await Workspace.create({
        name: 'Workspace owned by User A',
        color: '#C00',
        creator: userA.id,
        articles: [articleA, articleB],
      })

      await Workspace.create({
        name: 'Workspace owned by User B',
        color: '#C00',
        creator: userB.id,
        articles: [articleA, articleB],
        members: [{ user: userA }],
      })

      await Corpus.create({
        name: 'User B Corpus #1',
        description: 'because it is part of workspace which will be removed',
        creator: userB.id,
        articles: [
          { article: articleA.id, order: 1 },
          { article: articleB.id, order: 2 },
        ],
        workspace: w1,
      })

      await Corpus.create({
        name: 'User B Corpus #2',
        color: '#C00',
        creator: userB.id,
        articles: [
          { article: articleA.id, order: 1 },
          { article: articleB.id, order: 2 },
        ],
      })
    })

    test('user is soft deleted', async () => {
      // when
      await userA.softDelete()

      // then
      const user = await User.findOne({ displayName: '[deleted user]' })

      assert.notEqual(user.deletedAt, null)
      assert.equal(user.password, null)
      assert.match(user.email, /^deleted-user-[a-f0-9-]+@example.com$/)

      // user is soft deleted (i.e., still present in the database)
      const users = await User.find({})
      assert.equal(users.length, 2)

      // articles associated to this user should not be deleted
      const articles = await Article.find({})
      assert.equal(articles.length, 2)

      // article versions associated to this user should not be deleted
      const versions = await Version.find({})
      assert.equal(versions.length, 3)

      // tags associated to this user should not be deleted
      const tags = await Tag.find({})
      assert.equal(tags.length, 3)

      // workspaces associated to this user should not be deleted
      const workspaces = await Workspace.find({})
      assert.equal(workspaces.length, 2)

      // corpus associated to this user should not be deleted
      const corpuses = await Corpus.find({})
      assert.equal(corpuses.length, 2)
    })
  })
})
