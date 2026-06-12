const mongoose = require('mongoose')
const toHex = require('colornames')
const Schema = mongoose.Schema

const WorkspaceMemberSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

const workspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
      get: (color) => toHex(color) || color || '#ccc',
    },
    description: {
      type: String,
    },
    bibliographyStyle: {
      type: String,
    },
    formMetadata: {
      data: String,
      ui: String,
    },
    members: [WorkspaceMemberSchema],
    articles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Article',
      },
    ],
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    statics: {
      /**
       * Retrieves workspaces the given user is a member of.
       *
       * @param {import('./user')} user
       * @returns {mongoose.Query<import('./workspace')[], import('./workspace')>} workspaces
       */
      findByUser(user) {
        return this.find({ 'members.user': user?._id }).sort([
          ['updatedAt', -1],
        ])
      },

      /**
       * Retrieves workspaces that contain the given article.
       *
       * @param {import('mongoose').Types.ObjectId | string} articleId
       * @returns {mongoose.Query<import('./workspace')[], import('./workspace')>} workspaces
       */
      findByArticleId(articleId) {
        return this.find({ articles: articleId }).sort([['updatedAt', -1]])
      },

      async deleteArticle(workspaceId, articleId) {
        // remove article from corpuses associated to this workspace
        await this.model('Corpus').removeArticle(articleId, workspaceId)
        return this.updateOne(
          { _id: workspaceId, articles: articleId },
          {
            $pull: {
              articles: articleId,
            },
          },
          { timestamps: false }
        )
      },

      addArticle(workspaceId, articleId) {
        return this.updateOne(
          { _id: workspaceId, articles: { $nin: [articleId] } },
          {
            $push: {
              articles: articleId,
            },
          },
          { timestamps: false }
        )
      },

      getWorkspaceById(workspaceId, user) {
        if (user?.admin === true) {
          return this.findById(workspaceId)
        }

        return this.findOne({
          $and: [{ _id: workspaceId }, { 'members.user': user?._id }],
        })
      },

      /**
       * Removes an article from all workspaces where it appears.
       *
       * @param {import('mongoose').Types.ObjectId | string} articleId article unique identifier
       * @returns {Promise<import('mongodb').UpdateResult>}
       */
      removeArticle(articleId) {
        return this.updateMany(
          { articles: articleId },
          {
            $pull: {
              articles: articleId,
            },
          },
          { timestamps: true }
        )
      },
    },
    methods: {
      async findMembersByArticle(articleId) {
        const result = await this.aggregate([
          { $match: { articles: articleId } },
          // flatten members in order to create a unique set
          { $unwind: '$members' },
          { $group: { _id: null, memberIds: { $addToSet: '$members' } } },
          {
            $lookup: {
              from: 'users',
              localField: 'memberIds',
              foreignField: '_id',
              as: 'members',
            },
          },
        ])
        return result[0].members
      },
    },
  }
)

workspaceSchema.methods.leave = async function leave(userId) {
  return this.constructor.findOneAndUpdate(
    { _id: this._id },
    { $pull: { members: { user: new mongoose.Types.ObjectId(userId) } } },
    { lean: true }
  )
}

workspaceSchema.methods.inviteMember = async function inviteMember(userId) {
  const memberAlreadyInvited = this.members.find(
    (m) => String(m.user) === userId
  )
  if (memberAlreadyInvited) {
    return this
  }
  this.members.push({ user: userId })
  return this.save()
}

workspaceSchema.methods.addArticleById = async function addArticleById(
  articleId
) {
  const articleAlreadyAdded = this.articles.find(
    (id) => String(id) === articleId
  )
  if (articleAlreadyAdded) {
    return this
  }
  this.articles.push({ _id: articleId })
  return this.save()
}

workspaceSchema.methods.removeMember = async function removeMember(userId) {
  const member = this.members.find((m) => String(m.user) === userId)
  if (member) {
    this.members.pull({ _id: member._id })
    return this.save()
  }
  return this
}

workspaceSchema.methods.removeArticleById = async function removeArticleById(
  articleId
) {
  const article = this.articles.find((a) => String(a._id) === articleId)
  if (article) {
    this.articles.pull({ _id: article._id })
    return this.save()
  }
  return this
}

module.exports = mongoose.model('Workspace', workspaceSchema)
