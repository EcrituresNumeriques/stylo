const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CorpusArticleSchema = new Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
  },
  order: Number,
})

const corpusSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    articles: [CorpusArticleSchema],
    description: {
      type: String,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
      get: (metadata) => metadata ?? {},
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
    },
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
 * @returns {mongoose.Collection} corpuses
 */
corpusSchema.statics.findByUser = function findCorpusByUser(user) {
  return this
    .find({ creator: user._id })
    .sort([['updatedAt', -1]])
}

module.exports = mongoose.model('Corpus', corpusSchema)
