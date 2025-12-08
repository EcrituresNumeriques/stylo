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
    type: {
      type: String,
      default: 'neutral',
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
 * Retrieves corpuses owned by a given user in a given workspace.
 *
 * @param {object} params
 * @param {import('./user')} params.user
 * @param {import('./workspace')} [params.workspace]
 * @returns {mongoose.Collection<import('./corpus')>} corpuses
 */
corpusSchema.statics.findByUser = function findCorpusByUser({
  user,
  workspace = null,
}) {
  return this.find({ creator: user._id, workspace }).sort([['updatedAt', -1]])
}

/**
 * Removes an article from all corpuses where it appears.
 *
 * @param articleId article unique identifier
 * @returns {Promise<import('mongodb').UpdateResult<import('./corpus')>>}
 */
corpusSchema.statics.removeArticle = function removeArticle(articleId) {
  return this.updateMany(
    { 'articles.article': articleId },
    {
      $pull: {
        articles: {
          article: articleId,
        },
      },
    },
    { timestamps: true }
  )
}

module.exports = mongoose.model('Corpus', corpusSchema)
