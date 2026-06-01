const {
  NotFoundError,
  NotAuthenticatedError,
  BadRequestError,
} = require('../helpers/errors')
const Workspace = require('../models/workspace')
const Article = require('../models/article')
const Corpus = require('../models/corpus')

/**
 * @param workspaceId
 * @param token
 * @param user
 * @return {Promise<import('mongoose').EnforceDocument<Workspace>>}
 */
async function getWorkspace(workspaceId, token, user) {
  if (!workspaceId) {
    throw new BadRequestError('INVALID_INPUT', 'workspaceId is required.')
  }

  if (token?.admin) {
    const workspace = await Workspace.findById(workspaceId)
    if (!workspace) {
      throw new NotFoundError('Workspace', workspaceId)
    }
    return workspace
  }

  if (!user) {
    throw new NotAuthenticatedError()
  }

  const workspace = await Workspace.findOne({
    $and: [{ _id: workspaceId }, { 'members.user': user?._id }],
  })

  if (!workspace) {
    throw new NotFoundError('Workspace', workspaceId)
  }

  return workspace
}

async function workspace(_, { workspaceId }, { user, token }) {
  return await getWorkspace(workspaceId, token, user)
}

class WorkspaceArticle {
  constructor(workspace, article) {
    this.workspace = workspace
    this.article = article
  }

  async remove() {
    if (!this.article) return this.workspace
    return this.workspace.removeArticleById(String(this.article._id))
  }
}

class WorkspaceMember {
  constructor(workspace, member) {
    this.workspace = workspace
    this.member = member
  }

  async remove() {
    if (!this.member) return this.workspace
    return this.workspace.removeMember(String(this.member.user))
  }
}

module.exports = {
  Mutation: {
    async createWorkspace(_, args, { user }) {
      const { createWorkspaceInput } = args
      if (!user) {
        throw new NotAuthenticatedError()
      }
      // any user can create a workspace
      const newWorkspace = new Workspace({
        name: createWorkspaceInput.name,
        color: createWorkspaceInput.color,
        description: createWorkspaceInput.description,
        members: [{ user: user._id }],
        articles: [],
        creator: user._id,
      })
      return newWorkspace.save()
    },

    async updateWorkspaceFormMetadata(_, args, { user, token }) {
      const { details, workspaceId } = args
      if (!user) {
        throw new NotAuthenticatedError()
      }
      const { data, ui } = details
      if (data) {
        try {
          JSON.parse(data.trim())
        } catch {
          throw new BadRequestError(
            'INVALID_INPUT',
            'formMetadata.data must be a valid JSON.'
          )
        }
      }
      if (ui) {
        try {
          JSON.parse(ui.trim())
        } catch {
          throw new BadRequestError(
            'INVALID_INPUT',
            'formMetadata.ui must be a valid JSON.'
          )
        }
      }
      const workspace = await getWorkspace(workspaceId, token, user)
      workspace.formMetadata = details
      return workspace.save()
    },

    /**
     *
     */
    workspace,

    async leaveWorkspace(_, { workspaceId }, { user, token }) {
      const ws = await getWorkspace(workspaceId, token, user)
      return ws.leave(user.id)
    },

    async inviteWorkspaceMember(_, { workspaceId, userId }, { user, token }) {
      const ws = await getWorkspace(workspaceId, token, user)
      return ws.inviteMember(userId)
    },

    async addWorkspaceArticle(_, { workspaceId, articleId }, { user, token }) {
      const ws = await getWorkspace(workspaceId, token, user)
      return ws.addArticleById(articleId)
    },

    async removeWorkspaceMember(_, { workspaceId, userId }, { user, token }) {
      const ws = await getWorkspace(workspaceId, token, user)
      return ws.removeMember(userId)
    },

    async removeWorkspaceArticle(
      _,
      { workspaceId, articleId },
      { user, token }
    ) {
      const ws = await getWorkspace(workspaceId, token, user)
      return ws.removeArticleById(articleId)
    },
  },

  Query: {
    /**
     *
     */
    workspace,

    /**
     *
     */
    async workspaces(_root, _args, { user }) {
      if (user?.admin) {
        return Workspace.find()
      }

      return Workspace.findByUser(user)
    },
  },

  WorkspaceArticle: {
    async article(_workspaceArticle, { articleId }) {
      const article = workspace.articles.find(
        (a) => String(a._id) === articleId
      )
      return new WorkspaceArticle(workspace, article)
    },
  },

  Workspace: {
    async article(workspace, { articleId }) {
      const article = workspace.articles.find(
        (a) => String(a._id) === articleId
      )
      return new WorkspaceArticle(workspace, article)
    },

    /**
     *
     * @param workspace
     * @param _args
     * @param {{ loaders: { articles } }} context
     * @returns {Promise<*>}
     */
    async articles(workspace, _args, context) {
      return Article.getArticles({
        filter: { _id: { $in: workspace.articles } },
        loaders: context.loaders,
      })
    },

    async corpus(workspace) {
      return Corpus.find({ workspace: workspace._id })
        .populate([{ path: 'creator' }])
        .sort([['updatedAt', -1]])
    },

    async member(workspace, { userId }) {
      const member = workspace.members.find((m) => String(m.user) === userId)
      return new WorkspaceMember(workspace, member)
    },

    async members(workspace, { limit }) {
      await workspace.populate({ path: 'members', populate: 'user', limit })
      return workspace.members.map((m) => m.user)
    },

    async stats(workspace) {
      return {
        articlesCount: workspace.articles.length,
        membersCount: workspace.members.length,
      }
    },

    async creator(workspace, _args, context) {
      return await context.loaders.users.load(workspace.creator)
    },

    // mutations

    /** @deprecated Use leaveWorkspace root mutation instead. */
    async leave(workspace, _args, { user }) {
      if (!user) {
        throw new NotAuthenticatedError()
      }
      return workspace.leave(user.id)
    },

    /** @deprecated Use addWorkspaceArticle root mutation instead. */
    async addArticle(workspace, { articleId }) {
      return workspace.addArticleById(articleId)
    },

    /** @deprecated Use inviteWorkspaceMember root mutation instead. */
    async inviteMember(workspace, { userId }) {
      return workspace.inviteMember(userId)
    },
  },
}
