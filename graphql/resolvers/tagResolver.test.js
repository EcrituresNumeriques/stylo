const {
  Query: TagQuery,
  Mutation: TagMutation,
  Tag: TagResolver,
} = require('./tagResolver')
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

  describe('Mutation.createTag', () => {
    test('creates a tag from the input argument', async () => {
      const tag = await TagMutation.createTag(
        {},
        { input: { name: 'input', description: 'desc', color: '#ff0000' } },
        makeContext(user)
      )
      assert.equal(tag.name, 'input')
      assert.equal(tag.description, 'desc')
      assert.equal(tag.color, '#ff0000')
      assert.equal(tag.owner._id.toString(), user._id.toString())
    })

    test('creates a tag from the deprecated inline arguments', async () => {
      const tag = await TagMutation.createTag(
        {},
        { name: 'inline', color: '#00ff00' },
        makeContext(user)
      )
      assert.equal(tag.name, 'inline')
      assert.equal(tag.color, '#00ff00')
    })

    test('rejects a tag without name or color', async () => {
      await assert.rejects(
        () =>
          TagMutation.createTag({}, { name: 'no color' }, makeContext(user)),
        (error) => error.extensions.code === 'INVALID_INPUT'
      )
      await assert.rejects(
        () => TagMutation.createTag({}, {}, makeContext(user)),
        (error) => error.extensions.code === 'INVALID_INPUT'
      )
    })
  })

  describe('Mutation.updateTag', () => {
    test('updates a tag from the tagId and input arguments', async () => {
      const tag = await Tag.create({
        name: 'before',
        description: 'kept',
        color: '#000000',
        owner: user._id,
      })
      const updated = await TagMutation.updateTag(
        {},
        { tagId: tag._id, input: { name: 'after' } },
        makeContext(user)
      )
      assert.equal(updated.name, 'after')
      assert.equal(updated.description, 'kept')
    })

    test('updates a tag from the deprecated arguments', async () => {
      const tag = await Tag.create({
        name: 'before',
        color: '#000000',
        owner: user._id,
      })
      const updated = await TagMutation.updateTag(
        {},
        { tag: tag._id, color: '#ffffff' },
        makeContext(user)
      )
      assert.equal(updated.name, 'before')
      assert.equal(updated.color, '#ffffff')
    })

    test('requires the tag identifier', async () => {
      await assert.rejects(
        () =>
          TagMutation.updateTag(
            {},
            { input: { name: 'x' } },
            makeContext(user)
          ),
        (error) => error.extensions.code === 'INVALID_INPUT'
      )
    })
  })

  describe('Mutation.deleteTag', () => {
    test('returns the deleted tag', async () => {
      const tag = await Tag.create({ name: 'To delete', owner: user._id })

      const result = await TagMutation.deleteTag(
        {},
        { tagId: tag._id },
        makeContext(user)
      )

      assert.equal(result._id.toString(), tag._id.toString())
      assert.equal(await Tag.findById(tag._id), null)
    })

    test('refuses to delete a tag owned by another user', async () => {
      const other = await User.create({ email: 'delete-other@huma-num.fr' })
      const tag = await Tag.create({ name: 'Not mine', owner: other._id })

      await assert.rejects(() =>
        TagMutation.deleteTag({}, { tagId: tag._id }, makeContext(user))
      )
      assert.ok(await Tag.findById(tag._id))
    })
  })

  describe('Query.tag', () => {
    test('returns a tag owned by the user', async () => {
      const tag = await Tag.create({ name: 'My Tag', owner: user._id })

      const result = await TagQuery.tag({}, { tag: tag._id }, makeContext(user))

      assert.equal(result._id.toString(), tag._id.toString())
      assert.equal(result.name, 'My Tag')
    })

    test('accepts the tagId argument', async () => {
      const tag = await Tag.create({
        name: 'tagId',
        color: '#000000',
        owner: user._id,
      })
      const result = await TagQuery.tag(
        {},
        { tagId: tag._id },
        makeContext(user)
      )
      assert.equal(result.name, 'tagId')
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
