const mongoose = require('mongoose')
const toHex = require('colornames')
const Schema = mongoose.Schema

const tagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    color: {
      type: String,
      get: (color) => {
        return toHex((color ?? '').replace('grey', 'gray')) || color || '#ccc'
      },
    },
  },
  { timestamps: true }
)

/**
 *
 * @param {import('./user')} user
 * @returns {mongoose.Collection} tags
 */
tagSchema.statics.findByUser = function findTagByUser(user) {
  return this.find({ owner: user?._id }).sort([['updatedAt', -1]])
}

tagSchema.post(
  'deleteOne',
  { document: true, query: false },
  async function () {
    await this.model('Article').updateMany(
      { tags: this.id },
      { $pull: { tags: this.id } }
    )
  }
)

module.exports = mongoose.model('Tag', tagSchema)
