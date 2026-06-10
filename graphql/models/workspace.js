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
       *
       * @param {import('./user')} user
       * @returns {mongoose.Collection} workspaces
       */
      findByUser: function findWorkspaceByUser(user) {
        return this.find({ 'members.user': user?._id }).sort([
          ['updatedAt', -1],
        ])
      },

      /**
       * @returns {mongoose.Collection} workspaces
       */
      findByArticleId: function findWorkspaceByArticleId(articleId) {
        return this.find({ articles: articleId }).sort([['updatedAt', -1]])
      },

      deleteArticle: async function deleteArticle(workspaceId, articleId) {
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

      addArticle: function addArticle(workspaceId, articleId) {
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

      getWorkspaceById: function getWorkspaceById(workspaceId, user) {
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
       * @param articleId article unique identifier
       * @returns {Promise<import('mongodb').UpdateResult<import('./workspace')>>}
       */
      removeArticle: function removeArticle(articleId) {
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
      findMembersByArticle: async function findMembersByArticle(articleId) {
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

module.exports = mongoose.model('Workspace', workspaceSchema)
