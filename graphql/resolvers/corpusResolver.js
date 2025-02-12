const { ApiError } = require('../helpers/errors')
const Corpus = require('../models/corpus')
const Workspace = require('../models/workspace')

async function getCorpusByContext(corpusId, context) {
  if (context.token?.admin) {
    return getCorpus(corpusId)
  }
  const userId = context.userId
  if (!userId) {
    throw new ApiError(
      'UNAUTHENTICATED',
      `Unable to find an authentication context: ${context}`
    )
  }
  return getCorpusByUser(corpusId, userId)
}

async function getCorpus(corpusId) {
  const corpus = await Corpus.findById(corpusId).populate('creator')

  if (!corpus) {
    throw new ApiError('NOT_FOUND', `Unable to find corpus with id ${corpusId}`)
  }
  return corpus
}

async function getCorpusByUser(corpusId, userId) {
  const userWorkspaces = await Workspace.find({
    'members.user': userId,
  })
  const workspaceIds = userWorkspaces.map((w) => w._id)
  const corpus = await Corpus.findOne({
    _id: corpusId,
    $or: [{ creator: userId }, { workspace: { $in: workspaceIds } }],
  }).populate('creator')

  if (!corpus) {
    throw new ApiError('NOT_FOUND', `Unable to find corpus with id ${corpusId}`)
  }
  return corpus
}

class CorpusArticle {
  get article() {
    return this._article
  }

  get order() {
    return this._article.order
  }

  constructor(corpus, article) {
    this.corpus = corpus
    this._article = article
  }

  async remove() {
    if (this._article) {
      this.corpus.articles.pull({ _id: this._article._id })
      return this.corpus.save()
    }
    return this.corpus
  }

  async move(order) {
    if (this._article) {
      const articles = this.corpus.articles
      const map = new Map(articles.map((obj) => [obj.order, obj]))
      const currentOrder = this._article.order
      if (order < currentOrder) {
        for (let i = order; i < currentOrder; i++) {
          const article = map.get(i)
          if (article) {
            article.order = article.order + 1
          }
        }
      } else {
        for (let i = currentOrder; i < order; i++) {
          const article = map.get(i)
          if (article) {
            article.order = article.order - 1
          }
        }
      }
      this._article.order = order
      return this.corpus.save()
    }
    return this.corpus
  }
}

module.exports = {
  Mutation: {
    /**
     * Create a new corpus.
     *
     * @param _
     * @param { createCorpusInput } args
     * @param { user } user
     * @returns {Promise<*>}
     */
    async createCorpus(_, args, { user }) {
      const { createCorpusInput } = args
      if (!user) {
        throw new ApiError(
          'UNAUTHENTICATED',
          'Unable to create a corpus as an unauthenticated user'
        )
      }
      // any user can create a corpus
      const newCorpus = new Corpus({
        name: createCorpusInput.name,
        description: createCorpusInput.description,
        articles: [],
        metadata: createCorpusInput.metadata,
        workspace: createCorpusInput.workspace,
        creator: user._id,
      })
      return newCorpus.save()
    },

    /**
     * Get a corpus for a given id.
     *
     * @param _root
     * @param corpusId: string
     * @param {{ user: User, token: {}, userId: String }} context
     * @returns {Promise<*>}
     */
    async corpus(_root, { corpusId }, context) {
      return getCorpusByContext(corpusId, context)
    },
  },

  Query: {
    /**
     * Get a list of corpus.
     *
     * @param _
     * @param args
     * @param context
     * @returns {Promise<[Corpus]>}
     */
    async corpus(_, args, context) {
      const { user } = context

      if ('filter' in args) {
        const filter = args.filter
        if ('corpusId' in filter) {
          return [await getCorpus(filter.corpusId)]
        }
        if ('workspaceId' in filter) {
          return Corpus.find({ workspace: filter.workspaceId })
            .populate([{ path: 'creator' }])
            .sort([['updatedAt', -1]])
        }
      }
      return Corpus.find({ creator: user?._id, workspace: null })
        .populate([{ path: 'creator' }])
        .sort([['updatedAt', -1]])
    },
  },

  Corpus: {
    async articles(corpus, _args, context) {
      const articles = await Promise.all(
        corpus.articles.map(async (article) => {
          const articleLoaded = await context.loaders.articles.load(
            article.article
          )
          return {
            _id: article._id,
            order: article.order,
            article: articleLoaded,
          }
        })
      )
      articles.sort((a, b) => (a.order < b.order ? -1 : 1))
      return articles
    },

    async article(corpus, { articleId }) {
      const article = corpus.articles.find(({ article }) =>
        article.equals(articleId)
      )
      return new CorpusArticle(corpus, article)
    },

    async rename(corpus, { name }) {
      corpus.name = name
      return corpus.save()
    },

    async updateMetadata(corpus, { metadata }) {
      corpus.metadata = metadata
      return corpus.save()
    },

    async addArticle(corpus, { articleId, order }) {
      const articleAlreadyAdded = corpus.articles.find(
        ({ article }) => article.id === articleId
      )
      if (articleAlreadyAdded) {
        return corpus
      }
      corpus.articles.push({ article: { _id: articleId }, order })
      return corpus.save()
    },

    async delete(corpus) {
      await corpus.remove()
      if (corpus.$isDeleted()) {
        return corpus
      }
      throw new ApiError('ERROR', `Unable to delete the corpus ${corpus._id}`)
    },

    async update(corpus, { updateCorpusInput }) {
      corpus.name = updateCorpusInput.name
      corpus.description = updateCorpusInput.description
      const metadata = updateCorpusInput.metadata
      if (
        metadata &&
        typeof metadata === 'object' &&
        !Array.isArray(metadata)
      ) {
        corpus.metadata = metadata
      }
      return await corpus.save()
    },

    async updateArticlesOrder(corpus, { articlesOrderInput }) {
      console.log({ corpus })
      const articlesOrderMap = articlesOrderInput.reduce((acc, item) => {
        acc[item.articleId] = item.order
        return acc
      }, {})
      corpus.articles = corpus.articles.map((corpusArticle) => {
        const order = articlesOrderMap[corpusArticle.article._id]
        return {
          article: corpusArticle.article,
          order,
        }
      })
      return corpus.save()
    },
  },
}
