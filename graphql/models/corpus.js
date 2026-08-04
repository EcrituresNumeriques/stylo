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
  {
    timestamps: true,
    statics: {
      /**
       * Retrieves corpuses owned by a given user in a given workspace.
       *
       * @param {object} params
       * @param {import('./user')} params.user
       * @param {import('./workspace')} [params.workspace]
       * @returns {mongoose.Query<import('./corpus')[], import('./corpus')>} corpuses
       */
      findByUser({ user, workspace = null }) {
        return this.find({ creator: user._id, workspace }).sort([
          ['updatedAt', -1],
        ])
      },

      /**
       * Removes an article from all corpuses where it appears.
       *
       * @param {import('mongoose').Types.ObjectId | string} articleId article unique identifier
       * @param {string} [workspaceId] optional workspace identifier
       * @returns {Promise<import('mongodb').UpdateResult>}
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
  }
)

corpusSchema.methods.rename = async function rename(name) {
  this.name = name
  return this.save()
}

corpusSchema.methods.updateMetadata = async function updateMetadata(metadata) {
  this.metadata = metadata
  return this.save()
}

corpusSchema.methods.update = async function update(updateCorpusInput) {
  const name = updateCorpusInput.name
  if (name !== undefined && name !== null) {
    this.name = name
  }
  const description = updateCorpusInput.description
  if (description !== undefined && description !== null) {
    this.description = description
  }
  const metadata = updateCorpusInput.metadata
  if (metadata !== undefined) {
    this.metadata = metadata
  }
  return this.save()
}

corpusSchema.methods.addArticleById = async function addArticleById(
  articleId,
  order
) {
  const articleAlreadyAdded = this.articles.find(
    ({ article }) => article.id === articleId
  )
  if (articleAlreadyAdded) {
    return this
  }
  this.articles.push({ article: { _id: articleId }, order })
  return this.save()
}

corpusSchema.methods.removeArticleById = async function removeArticleById(
  articleId
) {
  const entry = this.articles.find(({ article }) => article.equals(articleId))
  if (entry) {
    this.articles.pull({ _id: entry._id })
    return this.save()
  }
  return this
}

corpusSchema.methods.moveArticle = async function moveArticle(
  articleId,
  order
) {
  const entry = this.articles.find(({ article }) => article.equals(articleId))
  if (!entry) {
    return this
  }
  const map = new Map(this.articles.map((obj) => [obj.order, obj]))
  const currentOrder = entry.order
  if (order < currentOrder) {
    for (let i = order; i < currentOrder; i++) {
      const a = map.get(i)
      if (a) {
        a.order = a.order + 1
      }
    }
  } else {
    for (let i = currentOrder; i < order; i++) {
      const a = map.get(i)
      if (a) {
        a.order = a.order - 1
      }
    }
  }
  entry.order = order
  return this.save()
}

corpusSchema.methods.updateArticlesOrder = async function updateArticlesOrder(
  articlesOrderInput
) {
  const articlesOrderMap = articlesOrderInput.reduce((acc, item) => {
    acc[item.articleId] = item.order
    return acc
  }, {})
  this.articles = this.articles.map((corpusArticle) => {
    const order = articlesOrderMap[corpusArticle.article._id]
    return {
      article: corpusArticle.article,
      order,
    }
  })
  return this.save()
}

module.exports = mongoose.model('Corpus', corpusSchema)
