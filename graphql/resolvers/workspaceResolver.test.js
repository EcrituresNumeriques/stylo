const { ObjectId } = require('mongoose').Types
const {
  Query,
  Mutation: RootMutation,
  Workspace: WorkspaceMutation,
} = require('./workspaceResolver')
const Workspace = require('../models/workspace')
const User = require('../models/user')
const Article = require('../models/article')

describe('workspace resolver', () => {
  test('create a workspace', async () => {
    const userId = new ObjectId('5a5b345f98f048281d88eac2')
    const context = {
      user: { id: userId.toString(), _id: userId._id },
      token: { admin: false },
    }
    let workspaces = await Query.workspaces({}, {}, context)
    expect(workspaces).toEqual([])
    await RootMutation.createWorkspace(
      {},
      {
        createWorkspaceInput: {
          name: 'Workspace A',
          color: '#49ffe0',
          description: 'Description',
        },
      },
      context
    )
    workspaces = await Query.workspaces({}, {}, context)
    expect(workspaces[0].toJSON()).toMatchObject({
      articles: [],
      color: '#49ffe0',
      creator: new ObjectId('5a5b345f98f048281d88eac2'),
      members: [{ user: new ObjectId('5a5b345f98f048281d88eac2') }],
      name: 'Workspace A',
    })
  })
  test('add a member to an existing workspace', async () => {
    const guillaume = await User.create({
      email: 'guillaume@huma-num.fr',
      firstName: 'Guillaume',
      lastName: 'Grossetie',
    })
    const thomas = await User.create({
      email: 'thomas@huma-num.fr',
      firstName: 'Thomas',
      lastName: 'Parisot',
    })
    let workspace = await Workspace.create({
      name: 'Workspace B',
      color: '#bb69ff',
      members: [{ user: guillaume.id }],
      articles: [],
      creator: guillaume.id,
    })
    workspace = await WorkspaceMutation.inviteMember(workspace, {
      userId: thomas.id,
    })
    const members = await WorkspaceMutation.members(workspace, { limit: 10 })
    expect(members.toObject()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          firstName: 'Guillaume',
          email: 'guillaume@huma-num.fr',
        }),
        expect.objectContaining({
          firstName: 'Thomas',
          email: 'thomas@huma-num.fr',
        }),
      ])
    )
  })
  test('remove existing member', async () => {
    const guillaume = await User.create({
      email: 'guillaume@huma-num.fr',
      firstName: 'Guillaume',
      lastName: 'Grossetie',
    })
    const thomas = await User.create({
      email: 'thomas@huma-num.fr',
      firstName: 'Thomas',
      lastName: 'Parisot',
    })
    const workspace = await Workspace.create({
      name: 'Workspace C',
      color: '#ff8c69',
      members: [{ user: guillaume.id }, { user: thomas.id }],
      articles: [],
      creator: guillaume.id,
    })
    const workspaceMember = await WorkspaceMutation.member(workspace, {
      userId: thomas.id,
    })
    await workspaceMember.remove()
    const workspaces = await Query.workspaces({}, {}, { user: guillaume })
    expect(workspaces[0].toJSON()).toMatchObject({
      articles: [],
      color: '#ff8c69',
      creator: guillaume._id,
      members: [{ user: guillaume._id }], // thomas was removed
      name: 'Workspace C',
    })
  })
  test('remove existing article', async () => {
    const guillaume = await User.create({
      email: 'guillaume@huma-num.fr',
      firstName: 'Guillaume',
      lastName: 'Grossetie',
    })
    const thesis = await Article.create({
      title: 'My Thesis',
      owner: guillaume.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const workspace = await Workspace.create({
      name: 'Workspace D',
      color: '#698cff',
      members: [{ user: guillaume.id }],
      articles: [thesis],
      creator: guillaume.id,
    })
    const workspaceArticle = await WorkspaceMutation.article(workspace, {
      articleId: thesis.id,
    })
    await workspaceArticle.remove()
    const workspaces = await Query.workspaces({}, {}, { user: guillaume })
    expect(workspaces[0].toJSON()).toMatchObject({
      articles: [],
      color: '#698cff',
      creator: guillaume._id,
      members: [{ user: guillaume._id }], // thomas was removed
      name: 'Workspace D',
    })
  })
})
