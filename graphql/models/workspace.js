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
  return this
    .find({ 'members.user': user?._id })
    .sort([
      ['updatedAt', -1],
    ])
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

module.exports = mongoose.model('Workspace', workspaceSchema)
