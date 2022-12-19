/**
 * @jest-environment ./jest/in-memory-mongodb-environment.js
 */
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const { Query, Mutation: RootMutation, Workspace: WorkspaceMutation } = require('./workspaceResolver')
const Workspace = require('../models/workspace')
const User = require('../models/user')

beforeAll(() => {
  globalThis.mongoose = mongoose
})

describe('workspace resolver', () => {
  test('create a workspace', async () => {
    const userId = new ObjectId('5a5b345f98f048281d88eac2')
    const user = { user: { admin: false, id: userId.toString(), _id: userId._id } }
    let workspaces = await Query.workspaces({}, user)
    expect(workspaces).toEqual([])
    await RootMutation.createWorkspace({}, {
      createWorkspaceInput: {
        name: 'Workspace A',
        color: '#49ffe0'
      }
    }, user)
    workspaces = await Query.workspaces({}, user)
    expect(workspaces[0]).toMatchObject({
      'articles': [],
      'color': '#49ffe0',
      'creator': new ObjectId('5a5b345f98f048281d88eac2'),
      'members': [{ user: new ObjectId('5a5b345f98f048281d88eac2') }],
      'name': 'Workspace A',
    })
  })
  test('add a member to an existing workspace', async () => {
    const guillaume = await User.create({
      email: 'guillaume@huma-num.fr',
      firstName: 'Guillaume',
      lastName: 'Grossetie'
    })
    const thomas = await User.create({
      email: 'thomas@huma-num.fr',
      firstName: 'Thomas',
      lastName: 'Parisot'
    })
    let workspace = await Workspace.create({
      name: 'Workspace B',
      color: '#bb69ff',
      members: [{ user: guillaume.id }],
      articles: [],
      creator: guillaume.id,
    })
    workspace = await WorkspaceMutation.inviteMember(workspace, { userId: thomas.id })
    const members = await WorkspaceMutation.members(workspace, { limit: 10 })
    expect(members.toObject()).toMatchObject([
      {
        user: {
          firstName: 'Guillaume',
          email: 'guillaume@huma-num.fr',
        }
      },
      {
        user: {
          firstName: 'Thomas',
          email: 'thomas@huma-num.fr',
        }
      },
    ])
  })
})
