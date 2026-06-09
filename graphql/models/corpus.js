const mongoose = require('mongoose')
const { logger } = require('../logger.js')
const { articlesLoader } = require('../loaders.js')
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
  {
    methods: {
      /**
       * @returns {Promise<import('./article')[]>}
       */
      async getArticles() {
        const articles = (
          await Promise.all(
            this.articles
              .map(async (article) => {
                const articleLoaded = await articlesLoader.load(article.article)
                if (articleLoaded === undefined) {
                  logger.warn(
                    `Unable to find article ${article.article} on corpus ${this._id}`
                  )
                  return undefined
                }
                return {
                  _id: article._id,
                  order: article.order,
                  article: articleLoaded,
                }
              })
              .filter((a) => a)
          )
        ).filter((a) => a)
        articles.sort((a, b) => (a.order < b.order ? -1 : 1))
        return articles
      },
    },
    statics: {
      /**
       * Retrieves corpuses owned by a given user in a given workspace.
       *
       * @param {object} params
       * @param {import('./user')} params.user
       * @param {import('./workspace')} [params.workspace]
       * @returns {mongoose.Collection<import('./corpus')>} corpuses
       */
      findByUser({ user, workspace = null }) {
        return this.find({ creator: user._id, workspace }).sort([
          ['updatedAt', -1],
        ])
      },
      /**
       * Removes an article from all corpuses where it appears.
       *
       * @param articleId article unique identifier
       * @param workspaceId optional workspace identifier
       * @returns {Promise<import('mongodb').UpdateResult<import('./corpus')>>}
       */
      removeArticle(articleId, workspaceId) {
        const query = { 'articles.article': articleId }
        if (workspaceId && workspaceId !== '') {
          query.workspace = workspaceId
        }
        return this.updateMany(
          query,
          {
            $pull: {
              articles: {
                article: articleId,
              },
            },
          },
          { timestamps: true }
        )
      },
    },
    timestamps: true,
  }
)

module.exports = mongoose.model('Corpus', corpusSchema)
