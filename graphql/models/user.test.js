const Article = require('./article.js')
const Corpus = require('./corpus.js')
const Tag = require('./tag.js')
const User = require('./user.js')
const Version = require('./version.js')
const Workspace = require('./workspace.js')

describe('getAuthProvidersCount', () => {
  test('returns 0 when value is missing', async () => {
    const user = new User({})

    expect(user.getAuthProvidersCount()).toBe(0)
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

    expect(user.getAuthProvidersCount()).toBe(1)
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

    expect(user.getAuthProvidersCount()).toBe(2)
  })
})

describe('remove', () => {
  let userA, userB

  beforeEach(async () => {
    userA = await User.create({
      email: 'a@example.com',
    })

    userB = await User.create({
      email: 'b@example.com',
    })

    const ta1 = await Tag.create({
      name: 'will be deleted',
      owner: userA
    })
    const ta2 = await Tag.create({
      name: 'will be deleted',
      owner: userA
    })
    const tb1 = await Tag.create({
      name: 'will not be deleted',
      owner: userB
    })

    const articleA = await Article.create({
      title: 'should be deleted',
      owner: userA,
      tags: [ta1, ta2]
    })

    await articleA.createNewVersion({
      mode: 'MAJOR',
      message: 'should be deleted',
      user: userB,
    })

    const articleB = await Article.create({
      title: 'should not be deleted',
      owner: userB,
      tags: [tb1],
      contributors: [{ user: userA, role: ['read', 'write'] }],
    })

    articleB.createNewVersion({
      mode: 'MAJOR',
      message: 'should not be deleted (we would lose content initiated by another user)',
      user: userA,
    })

    const w1 = await Workspace.create({
      name: 'should be deleted',
      color: '#C00',
      creator: userA.id,
      articles: [articleA, articleB],
    })

    await Workspace.create({
      name: 'should not be deleted',
      color: '#C00',
      creator: userB.id,
      articles: [articleA, articleB],
      members: [{ user: userA }]
    })

    await Corpus.create({
      name: 'should be deleted',
      description: 'because it is part of workspace which will be removed',
      creator: userB.id,
      articles: [{ article: articleA.id, order: 1 }, { article: articleB.id, order: 2 }],
      workspace: w1
    })

    await Corpus.create({
      name: 'should not be deleted',
      color: '#C00',
      creator: userB.id,
      articles: [{ article: articleA.id, order: 1 }, { article: articleB.id, order: 2 }],
    })

    await userA.remove()
  })

  test('user does not exist anymore', async () => {
    const user = await User.findOne({ email: 'a@example.com' })

    expect(user).toBeNull()
  })


  test('article should be removed, and user from contributors', async () => {
    const articles = await Article.find()
    expect(articles).toHaveLength(1)
    expect(articles).toHaveProperty('0.title', 'should not be deleted')
    expect(articles.at(0).get('contributors')).toHaveLength(0)
  })

  test('only versions of deleted articles are deleted', async () => {
    const versions = await Version.find()
    expect(versions).toHaveLength(1)
    expect(versions).toHaveProperty('0.message', 'should not be deleted')
  })

  test('tags are deleted', async () => {
    const tags = await Tag.find()
    expect(tags).toHaveLength(1)
    expect(tags).toHaveProperty('0.name', 'will not be deleted')
  })

  test('workspaces are deleted', async () => {
    const workspaces = await Workspace.find()
    expect(workspaces).toHaveLength(1)
    expect(workspaces).toHaveProperty('0.name', 'should not be deleted')
    expect(workspaces).toHaveProperty('0.members', [])
  })

  test('corpus are deleted', async () => {
    const corpuses = await Corpus.find()
    expect(corpuses).toHaveLength(1)
    expect(corpuses).toHaveProperty('0.name', 'should not be deleted')
  })
})
