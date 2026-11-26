const mongoose = require('mongoose')
const Schema = mongoose.Schema

const { searchable } = require('../plugins/search.js')

/** @typedef {import('./corpus')} Corpus */
/** @typedef {import('./user')} User */
/** @typedef {import('mongoose').Types.ObjectId} ObjectId */

const CorpusArticleSchema = new Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
  },
  order: Number,
  addedAt: Date,
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
       * Filter of the corpora a user has access to: their own corpora outside
       * workspaces or the corpora of the workspaces; only the latter without user.
       *
       * @param {{ _id: ObjectId }[]} workspaces
       * @param {User} [user]
       * @returns {import('mongoose').FilterQuery<Corpus>}
       */
      accessFilter(workspaces, user) {
        const inWorkspaces = {
          workspace: { $in: workspaces.map(({ _id }) => _id) },
        }
        if (!user) {
          return inWorkspaces
        }
        return { $or: [{ creator: user._id, workspace: null }, inWorkspaces] }
      },

      /**
       * Retrieves corpuses owned by a given user in a given workspace.
       *
       * @param {object} params
       * @param {User} params.user
       * @param {import('./workspace')} [params.workspace]
       * @returns {mongoose.Query<Corpus[], Corpus>} corpuses
       */
      findByUser({ user, workspace = null }) {
        return this.find({ creator: user._id, workspace }).sort([
          ['updatedAt', -1],
        ])
      },

      /**
       * Removes an article from all corpuses where it appears.
       *
       * @param {ObjectId | string} articleId article unique identifier
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

      /**
       * Builds a corpus entry for an article added now.
       *
       * @param {import('mongoose').Types.ObjectId | string} articleId
       * @param {number} [order]
       * @returns {{ article: { _id: import('mongoose').Types.ObjectId | string }, order: number, addedAt: Date }}
       */
      newArticleEntry(articleId, order = 0) {
        return { article: { _id: articleId }, order, addedAt: new Date() }
      },
    },
  }
)

corpusSchema.plugin(searchable, { langPath: 'metadata.lang' })

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

/**
 * Appends articles at the end of the corpus, in the given order.
 * Articles already in the corpus are ignored.
 *
 * @param {string[]} articleIds
 */
corpusSchema.methods.addArticles = async function addArticles(articleIds) {
  const present = new Set(
    this.articles.map(({ article }) => article.toString())
  )
  const toAdd = [...new Set(articleIds)].filter((id) => !present.has(id))
  const lastOrder = Math.max(
    -1,
    ...this.articles.map(({ order }) => order ?? -1)
  )
  this.articles.push(
    ...toAdd.map((articleId, index) =>
      this.constructor.newArticleEntry(articleId, lastOrder + 1 + index)
    )
  )
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
  for (const corpusArticle of this.articles) {
    corpusArticle.order = articlesOrderMap[corpusArticle.article._id]
  }
  return this.save()
}

module.exports = mongoose.model('Corpus', corpusSchema)
