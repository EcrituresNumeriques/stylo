const { graphql } = require('graphql')
const schema = require('./schema.js')
const Article = require('./models/article.js')
const Corpus = require('./models/corpus.js')
const Tag = require('./models/tag.js')
const User = require('./models/user.js')
const Version = require('./models/version.js')
const Workspace = require('./models/workspace.js')
const { createLoaders } = require('./loaders.js')

const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('./tests/harness.js')

describe('schema', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  test('exposes id on every type that has an _id', async () => {
    const user = await User.create({ email: 'schema-id@huma-num.fr' })
    const tag = await Tag.create({ name: 'Tag', owner: user._id })
    const version = await Version.create({ owner: user._id })
    const article = await Article.create({
      title: 'Article',
      owner: user._id,
      tags: [tag._id],
      versions: [version._id],
    })
    const workspace = await Workspace.create({
      name: 'Workspace',
      color: '#f4a261',
      members: [{ user: user._id }],
      articles: [article._id],
      creator: user._id,
    })
    const corpus = await Corpus.create({
      name: 'Corpus',
      creator: user._id,
      articles: [],
    })

    const { data, errors } = await graphql({
      schema,
      source: `query ($workspaceId: ID!) {
        user { id _id }
        articles {
          id
          _id
          owner { id }
          tags { id }
          versions { id }
        }
        workspace(workspaceId: $workspaceId) { id _id }
        corpora { id _id }
      }`,
      variableValues: { workspaceId: workspace.id },
      contextValue: {
        user,
        userId: user.id,
        token: { _id: user.id },
        loaders: createLoaders(),
      },
    })

    assert.equal(errors, undefined)
    assert.deepEqual(data.user, { id: user.id, _id: user.id })
    assert.deepEqual(data.articles, [
      {
        id: article.id,
        _id: article.id,
        owner: { id: user.id },
        tags: [{ id: tag.id }],
        versions: [{ id: version.id }],
      },
    ])
    assert.deepEqual(data.workspace, { id: workspace.id, _id: workspace.id })
    assert.deepEqual(data.corpora, [{ id: corpus.id, _id: corpus.id }])
  })
})
