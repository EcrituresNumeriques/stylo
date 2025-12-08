const { ObjectId } = require('mongoose').Types
const {
  Query,
  Mutation: RootMutation,
  Workspace: WorkspaceMutation,
} = require('./workspaceResolver')
const Workspace = require('../models/workspace')
const User = require('../models/user')
const Article = require('../models/article')

const { after, before, describe, test } = require('node:test')
const assert = require('node:assert')
const { setup, teardown } = require('../tests/harness.js')

describe('workspace resolver', () => {
  let container
  before(async () => {
    container = await setup()
  })

  after(async () => {
    await teardown(container)
  })

  test('create a workspace', async () => {
    const userId = new ObjectId('5a5b345f98f048281d88eac2')
    const context = {
      user: { id: userId.toString(), _id: userId._id },
      token: { admin: false },
    }
    let workspaces = await Query.workspaces({}, {}, context)
    assert.deepEqual(workspaces, [])
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
    const firstWorkspaceFound = workspaces[0].toJSON()
    assert.deepEqual(firstWorkspaceFound.articles, [])
    assert.deepEqual(firstWorkspaceFound.color, '#49ffe0')
    assert.deepEqual(
      firstWorkspaceFound.creator.toString(),
      '5a5b345f98f048281d88eac2'
    )
    assert.deepEqual(
      firstWorkspaceFound.members.map((m) => m.user.toString()),
      ['5a5b345f98f048281d88eac2']
    )
    assert.deepEqual(firstWorkspaceFound.name, 'Workspace A')
  })
  test('add a member to an existing workspace', async () => {
    const user1 = await User.create({
      email: 'guillaume@huma-num.fr',
      firstName: 'Guillaume',
      lastName: 'Grossetie',
    })
    const user2 = await User.create({
      email: 'thomas@huma-num.fr',
      firstName: 'Thomas',
      lastName: 'Parisot',
    })
    let workspace = await Workspace.create({
      name: 'Workspace B',
      color: '#bb69ff',
      members: [{ user: user1.id }],
      articles: [],
      creator: user1.id,
    })
    workspace = await WorkspaceMutation.inviteMember(workspace, {
      userId: user2.id,
    })
    const members = await WorkspaceMutation.members(workspace, { limit: 10 })
    assert.deepEqual(
      members.map((m) => {
        const memberObj = m.toObject()
        return {
          firstName: memberObj.firstName,
          email: memberObj.email,
        }
      }),
      [
        {
          firstName: 'Guillaume',
          email: 'guillaume@huma-num.fr',
        },
        {
          firstName: 'Thomas',
          email: 'thomas@huma-num.fr',
        },
      ]
    )
  })
  test('remove existing member', async () => {
    const user1 = await User.create({
      email: 'clara@huma-num.fr',
      firstName: 'Clara',
    })
    const user2 = await User.create({
      email: 'victor@huma-num.fr',
      firstName: 'Victor',
    })
    const workspace = await Workspace.create({
      name: 'Workspace C',
      color: '#ff8c69',
      members: [{ user: user1.id }, { user: user2.id }],
      articles: [],
      creator: user1.id,
    })
    const workspaceMember = await WorkspaceMutation.member(workspace, {
      userId: user2.id,
    })
    await workspaceMember.remove()
    const workspaces = await Query.workspaces({}, {}, { user: user1 })
    const firstWorkspaceFound = workspaces[0].toJSON()
    assert.deepEqual(firstWorkspaceFound.articles, [])
    assert.deepEqual(firstWorkspaceFound.color, '#ff8c69')
    assert.deepEqual(
      firstWorkspaceFound.creator.toString(),
      user1._id.toString()
    )
    assert.deepEqual(
      firstWorkspaceFound.members.map((m) => m.user.toString()),
      [user1._id.toString()] // thomas was removed
    )
    assert.deepEqual(firstWorkspaceFound.name, 'Workspace C')
  })
  test('remove existing article', async () => {
    const user1 = await User.create({
      email: 'david@huma-num.fr',
      firstName: 'David',
    })
    const thesis = await Article.create({
      title: 'My Thesis',
      owner: user1.id,
      contributors: [],
      versions: [],
      tags: [],
    })
    const workspace = await Workspace.create({
      name: 'Workspace D',
      color: '#698cff',
      members: [{ user: user1.id }],
      articles: [thesis],
      creator: user1.id,
    })
    const workspaceArticle = await WorkspaceMutation.article(workspace, {
      articleId: thesis.id,
    })
    await workspaceArticle.remove()
    const workspaces = await Query.workspaces({}, {}, { user: user1 })

    const firstWorkspaceFound = workspaces[0].toJSON()
    assert.deepEqual(firstWorkspaceFound.articles, [])
    assert.deepEqual(firstWorkspaceFound.color, '#698cff')
    assert.deepEqual(
      firstWorkspaceFound.creator.toString(),
      user1._id.toString()
    )
    assert.deepEqual(
      firstWorkspaceFound.members.map((m) => m.user.toString()),
      [user1._id.toString()]
    )
    assert.deepEqual(firstWorkspaceFound.name, 'Workspace D')
  })
  test('update form metadata', async () => {
    const userId = new ObjectId('5a5b345f98f048281d88eac2')
    const context = {
      user: { id: userId.toString(), _id: userId._id },
      token: { admin: false },
    }
    const workspace = await Workspace.create({
      name: 'Workspace',
      color: '#ff69e8',
      members: [{ user: userId }],
      articles: [],
      creator: userId,
    })
    await RootMutation.updateWorkspaceFormMetadata(
      {},
      {
        workspaceId: workspace.id,
        details: {
          data: `{"title": "book"}`,
          ui: `{"ui:groups": []}`,
        },
      },
      context
    )
    const getWorkspace = await Query.workspace(
      {},
      { workspaceId: workspace.id },
      context
    )

    const getWorkspaceObj = getWorkspace.toJSON()

    assert.deepEqual(getWorkspaceObj.articles, [])
    assert.deepEqual(getWorkspaceObj.color, '#ff69e8')
    assert.deepEqual(getWorkspaceObj.creator.toString(), userId.toString())
    assert.deepEqual(
      getWorkspaceObj.members.map((m) => m.user.toString()),
      [userId.toString()]
    )
    assert.deepEqual(getWorkspaceObj.name, 'Workspace')
    assert.deepEqual(getWorkspaceObj.formMetadata, {
      data: `{"title": "book"}`,
      ui: `{"ui:groups": []}`,
    })
  })
  test('update form metadata with invalid data JSON', async () => {
    const userId = new ObjectId('5a5b345f98f048281d88eac2')
    const context = {
      user: { id: userId.toString(), _id: userId._id },
      token: { admin: false },
    }
    const workspace = await Workspace.create({
      name: 'Workspace',
      color: '#ff69e8',
      members: [{ user: userId }],
      articles: [],
      creator: userId,
    })

    await assert.rejects(
      () =>
        RootMutation.updateWorkspaceFormMetadata(
          {},
          {
            workspaceId: workspace.id,
            details: {
              data: `{"title":}`, // invalid JSON
              ui: `{"ui:groups": []}`,
            },
          },
          context
        ),
      {
        message: 'formMetadata.data must be a valid JSON.',
      }
    )
  })
  test('update form metadata with invalid ui JSON', async () => {
    const userId = new ObjectId('5a5b345f98f048281d88eac2')
    const context = {
      user: { id: userId.toString(), _id: userId._id },
      token: { admin: false },
    }
    const workspace = await Workspace.create({
      name: 'Workspace',
      color: '#ff69e8',
      members: [{ user: userId }],
      articles: [],
      creator: userId,
    })

    await assert.rejects(
      () =>
        RootMutation.updateWorkspaceFormMetadata(
          {},
          {
            workspaceId: workspace.id,
            details: {
              data: `{"title": "book"}`,
              ui: `{`, // invalid JSON
            },
          },
          context
        ),
      {
        message: 'formMetadata.ui must be a valid JSON.',
      }
    )
  })
})
