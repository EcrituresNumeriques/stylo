const Article = require('./article.js')
const Corpus = require('./corpus.js')
const User = require('./user.js')
const Workspace = require('./workspace.js')

const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

describe('deleteArticle', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  test('removes the article from the workspace and its corpuses, but not from corpuses of another workspace', async () => {
    // given
    const user = await User.create({ email: 'b@example.com' })

    const article = await Article.create({
      title: 'Article A',
      owner: user.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const otherArticle = await Article.create({
      title: 'Article B',
      owner: user.id,
      contributors: [],
      versions: [],
      tags: [],
    })

    const workspace = await Workspace.create({
      name: 'Workspace 1',
      color: '#bb69ff',
      members: [{ user: user.id }],
      articles: [article.id, otherArticle.id],
      creator: user.id,
    })

    const otherWorkspace = await Workspace.create({
      name: 'Workspace 2',
      color: '#ffaa00',
      members: [{ user: user.id }],
      articles: [article.id],
      creator: user.id,
    })

    // corpus in workspace 1: contains the article to delete
    const corpusInWorkspace = await Corpus.create({
      name: 'Corpus W1',
      articles: [
        { article: article.id, order: 1 },
        { article: otherArticle.id, order: 2 },
      ],
      workspace: workspace.id,
      creator: user.id,
    })

    // corpus in workspace 2: also contains the article to delete
    const corpusInOtherWorkspace = await Corpus.create({
      name: 'Corpus W2',
      articles: [{ article: article.id, order: 1 }],
      workspace: otherWorkspace.id,
      creator: user.id,
    })

    // when — delete the article from workspace 1 only
    await Workspace.deleteArticle(workspace.id, article.id)

    // then — the article is removed from workspace 1
    const w1 = await Workspace.findById(workspace.id)
    assert.strictEqual(w1.articles.length, 1)
    assert.strictEqual(w1.articles[0].toString(), otherArticle.id)

    // then — the article is removed from the corpus of workspace 1
    const c1 = await Corpus.findById(corpusInWorkspace.id)
    assert.strictEqual(c1.articles.length, 1)
    assert.strictEqual(c1.articles[0].article.toString(), otherArticle.id)

    // then — the corpus of workspace 2 is unchanged (the article is still present)
    const c2 = await Corpus.findById(corpusInOtherWorkspace.id)
    assert.strictEqual(c2.articles.length, 1)
    assert.strictEqual(c2.articles[0].article.toString(), article.id)

    // then — workspace 2 is unchanged
    const w2 = await Workspace.findById(otherWorkspace.id)
    assert.strictEqual(w2.articles.length, 1)
    assert.strictEqual(w2.articles[0].toString(), article.id)
  })
})
