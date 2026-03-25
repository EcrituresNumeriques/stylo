const { Query: TagQuery, Tag: TagResolver } = require('./tagResolver')
const Tag = require('../models/tag')
const Article = require('../models/article')
const User = require('../models/user')
const { ObjectId } = require('mongoose').Types
const { before, after, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness')

describe('Tag resolver', () => {
  let container
  let user

  before(async () => {
    container = await setup()
    user = await User.create({ email: 'test@huma-num.fr' })
  })

  after(async () => {
    await teardown(container)
  })

  const makeContext = (u, { admin = false } = {}) => ({
    user: u,
    token: { _id: u._id.toString(), admin },
  })

  describe('Tag.articles', () => {
    test('returns articles linked to a tag', async () => {
      const tag = await Tag.create({ name: 'Science', owner: user._id })
      await Article.create({
        title: 'Article A',
        owner: user._id,
        tags: [tag._id],
      })
      await Article.create({
        title: 'Article B',
        owner: user._id,
        tags: [tag._id],
      })
      await Article.create({
        title: 'Article without tag',
        owner: user._id,
        tags: [],
      })

      const articles = await TagResolver.articles(tag, {})

      assert.equal(articles.length, 2)
      assert.deepEqual(articles.map((a) => a.title).sort(), [
        'Article A',
        'Article B',
      ])
    })

    test('returns an empty array when no article is linked to the tag', async () => {
      const tag = await Tag.create({ name: 'Empty', owner: user._id })

      const articles = await TagResolver.articles(tag, {})

      assert.deepEqual(articles, [])
    })
  })

  describe('Query.tag', () => {
    test('returns a tag owned by the user', async () => {
      const tag = await Tag.create({ name: 'My Tag', owner: user._id })

      const result = await TagQuery.tag({}, { tag: tag._id }, makeContext(user))

      assert.equal(result._id.toString(), tag._id.toString())
      assert.equal(result.name, 'My Tag')
    })

    test('throws a not found error when the tag does not exist', async () => {
      await assert.rejects(
        () => TagQuery.tag({}, { tag: new ObjectId() }, makeContext(user)),
        (err) => {
          assert.equal(err.extensions?.code, 'NOT_FOUND')
          return true
        }
      )
    })

    test('admin can access a tag they do not own', async () => {
      const otherUser = await User.create({ email: 'other@huma-num.fr' })
      const tag = await Tag.create({ name: 'Other Tag', owner: otherUser._id })

      const admin = await User.create({ email: 'admin@huma-num.fr' })
      const result = await TagQuery.tag(
        {},
        { tag: tag._id },
        makeContext(admin, { admin: true })
      )

      assert.equal(result._id.toString(), tag._id.toString())
    })

    test('does not return a tag owned by another user', async () => {
      const otherUser = await User.create({ email: 'other2@huma-num.fr' })
      const tag = await Tag.create({
        name: 'Private Tag',
        owner: otherUser._id,
      })

      await assert.rejects(
        () => TagQuery.tag({}, { tag: tag._id }, makeContext(user)),
        (err) => {
          assert.equal(err.extensions?.code, 'NOT_FOUND')
          return true
        }
      )
    })
  })
})
