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

  test('resolves the non-null lists and mutation results', async () => {
    const user = await User.create({ email: 'schema-non-null@huma-num.fr' })
    // an article without bibliography, tag, version, contributor or workspace
    const article = await Article.create({
      title: 'Empty article',
      owner: user._id,
      workingVersion: { bib: null },
    })
    const contextValue = {
      user,
      userId: user.id,
      token: { _id: user.id },
      loaders: createLoaders(),
    }

    const query = await graphql({
      schema,
      source: `query ($articleId: ID!) {
        user {
          tags { id }
          articles { id }
          workspaces { id }
          contacts { id }
        }
        tags { id }
        workspaces { id }
        articles { id }
        article(articleId: $articleId) {
          contributors { user { id } }
          versions { id }
          workspaces { id }
          tags { id }
          workingVersion { bibliography { key } }
        }
      }`,
      variableValues: { articleId: article.id },
      contextValue,
    })

    assert.equal(query.errors, undefined)
    assert.deepEqual(query.data.user, {
      tags: [],
      articles: [{ id: article.id }],
      workspaces: [],
      contacts: [],
    })
    assert.deepEqual(query.data.article, {
      contributors: [],
      versions: [],
      workspaces: [],
      tags: [],
      workingVersion: { bibliography: [] },
    })

    const mutation = await graphql({
      schema,
      source: `mutation ($articleId: ID!) {
        createTag(input: { name: "Tag", color: "#000000" }) { id name }
        updateArticleBibliography(articleId: $articleId, input: { bib: "" }) { key }
        setArticleZoteroLink(articleId: $articleId, zotero: "zotero") { id }
        deleteArticle(articleId: $articleId, dryRun: true) { id }
      }`,
      variableValues: { articleId: article.id },
      contextValue,
    })

    assert.equal(mutation.errors, undefined)
    assert.equal(mutation.data.createTag.name, 'Tag')
    assert.deepEqual(mutation.data.updateArticleBibliography, [])
    assert.deepEqual(mutation.data.setArticleZoteroLink, { id: article.id })
    assert.deepEqual(mutation.data.deleteArticle, { id: article.id })
  })
})
