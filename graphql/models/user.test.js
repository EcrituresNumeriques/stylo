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

describe('softDelete', () => {
  let userA, userB

  beforeEach(async () => {
    userA = await User.create({
      email: 'a@example.com',
    })

    userB = await User.create({
      email: 'b@example.com',
    })

    const ta1 = await Tag.create({
      name: 'User A tag #1',
      owner: userA
    })
    const ta2 = await Tag.create({
      name: 'User A tag #2',
      owner: userA
    })
    const tb1 = await Tag.create({
      name: 'User B tag',
      owner: userB
    })

    const articleA = await Article.create({
      title: 'User A article #1',
      owner: userA,
      tags: [ta1, ta2]
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
      members: [{ user: userA }]
    })

    await Corpus.create({
      name: 'User B Corpus #1',
      description: 'because it is part of workspace which will be removed',
      creator: userB.id,
      articles: [{ article: articleA.id, order: 1 }, { article: articleB.id, order: 2 }],
      workspace: w1
    })

    await Corpus.create({
      name: 'User B Corpus #2',
      color: '#C00',
      creator: userB.id,
      articles: [{ article: articleA.id, order: 1 }, { article: articleB.id, order: 2 }],
    })

    await userA.softDelete()
  })

  test('user does not exist anymore', async () => {
    const user = await User.findOne({ displayName: '[deleted user]' })

    expect(user).toHaveProperty('deletedAt', expect.any(Date))
    expect(user).toHaveProperty('password', null)
    expect(user).toHaveProperty('email', expect.stringMatching(/^deleted-user-[a-f0-9-]+@example.com$/))

    return expect(await await User.find()).toHaveLength(2)
  })


  test('articles should still be here', async () => {
    const articles = await Article.find()
    expect(articles).toHaveLength(2)
  })

  test('article versions should still be here', async () => {
    const versions = await Version.find()
    expect(versions).toHaveLength(3)
  })

  test('tags should still be here', async () => {
    const tags = await Tag.find()
    expect(tags).toHaveLength(3)
  })

  test('workspaces should still be here', async () => {
    const workspaces = await Workspace.find()
    expect(workspaces).toHaveLength(2)
  })

  test('corpus should still be here', async () => {
    const corpuses = await Corpus.find()
    expect(corpuses).toHaveLength(2)
  })
})
