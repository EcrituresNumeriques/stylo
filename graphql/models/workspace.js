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
  { timestamps: true }
)

/**
 *
 * @param {import('./user')} user
 * @returns {mongoose.Collection} workspaces
 */
workspaceSchema.statics.findByUser = function findWorkspaceByUser(user) {
  return this.find({ 'members.user': user?._id }).sort([['updatedAt', -1]])
}

/**
 * @returns {mongoose.Collection} workspaces
 */
workspaceSchema.statics.findByArticleId = function findWorkspaceByArticleId(
  articleId
) {
  return this.find({ articles: articleId }).sort([['updatedAt', -1]])
}

workspaceSchema.methods.findMembersByArticle =
  async function findMembersByArticle(articleId) {
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
  }

workspaceSchema.statics.deleteArticle = function deleteArticle(
  workspaceId,
  articleId
) {
  return this.updateOne(
    { _id: workspaceId, articles: articleId },
    {
      $pull: {
        articles: articleId,
      },
    },
    { timestamps: false }
  )
}

workspaceSchema.statics.addArticle = function addArticle(
  workspaceId,
  articleId
) {
  return this.updateOne(
    { _id: workspaceId, articles: { $nin: [articleId] } },
    {
      $push: {
        articles: articleId,
      },
    },
    { timestamps: false }
  )
}

workspaceSchema.statics.getWorkspaceById = function getWorkspaceById(
  workspaceId,
  user
) {
  if (user?.admin === true) {
    return this.findById(workspaceId)
  }

  return this.findOne({
    $and: [{ _id: workspaceId }, { 'members.user': user?._id }],
  })
}

/**
 * Removes an article from all workspaces where it appears.
 *
 * @param articleId article unique identifier
 * @returns {Promise<import('mongodb').UpdateResult<import('./workspace')>>}
 */
workspaceSchema.statics.removeArticle = function removeArticle(articleId) {
  return this.updateMany(
    { articles: articleId },
    {
      $pull: {
        articles: articleId,
      },
    },
    { timestamps: true }
  )
}

module.exports = mongoose.model('Workspace', workspaceSchema)
