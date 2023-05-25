const mongoose = require('mongoose')
const toHex = require('colornames')
const Schema = mongoose.Schema

const WorkspaceMemberSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  role: String
})

const workspaceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
    get: color => toHex(color) || color || '#ccc'
  },
  role: {
    type: String
  },
  bibliographyStyle: {
    type: String
  },
  members: [ WorkspaceMemberSchema ],
  articles: [{
    type: Schema.Types.ObjectId,
    ref: 'Article'
  }],
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true })

workspaceSchema.methods.findMembersByArticle = async function findMembersByArticle (articleId) {
  const result = await this.aggregate([
    { $match: { articles: articleId } },
    // flatten members in order to create a unique set
    { $unwind: '$members' },
    { $group: { _id: null, memberIds: { $addToSet: '$members' } } },
    { $lookup: { from: 'users', localField: 'memberIds', foreignField: '_id', as: 'members' } }
  ])
  return result[0].members
}

module.exports = mongoose.model('Workspace', workspaceSchema)
module.exports.schema = workspaceSchema
