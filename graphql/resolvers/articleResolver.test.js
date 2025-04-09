const { ObjectId } = require('mongoose').Types
const { Article: ArticleMutation } = require('./articleResolver')
const Workspace = require('../models/workspace')
const Article = require('../models/article')

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
    let workspaces = await ArticleMutation.workspaces(article, {}, context)
    expect(workspaces.map((w) => w.toObject())).toMatchObject([
      { name: 'Workspace A' },
      //  should not contain Workspace B because user is not invited in this workspace
      { name: 'Workspace C' },
    ])
    const contextWithAdminUser = {
      user: { ...context.user },
      token: { admin: true },
    }
    workspaces = await ArticleMutation.workspaces(
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
