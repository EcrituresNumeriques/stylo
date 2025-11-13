const { NotFoundError, NotAuthenticatedError } = require('../helpers/errors.js')
const Corpus = require('../models/corpus')
const Workspace = require('../models/workspace')

const { logger } = require('../logger')
const { NotAuthorizedError } = require('../helpers/errors')

async function getCorpusByContext(corpusId, context) {
  if (context.token?.admin) {
    return getCorpus(corpusId)
  }
  const userId = context.userId
  if (!userId) {
    throw new NotAuthenticatedError()
  }

  return getCorpusByUser(corpusId, userId)
}

async function getCorpus(corpusId) {
  const corpus = await Corpus.findById(corpusId).populate('creator')

  if (!corpus) {
    throw new NotFoundError('Corpus', corpusId)
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
    throw new NotFoundError('Corpus', corpusId)
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
        throw new NotAuthenticatedError()
      }

      // any user can create a corpus
      const newCorpus = new Corpus({
        name: createCorpusInput.name,
        type: createCorpusInput.type,
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
      const { user, userId, token } = context
      const filter = args?.filter

      const workspaceIdFilter = filter?.workspaceId
      const corpusIdFilter = filter?.corpusId

      if (corpusIdFilter) {
        const corpus = await Corpus.findOne({ _id: corpusIdFilter }).orFail(
          new NotFoundError('Corpus', corpusIdFilter)
        )

        // QUESTION: should we check the corpus workspace is equals to filter.workspaceId (if defined)?

        if (corpus.workspace) {
          // permission: make sure that the user belongs to the corpus workspace
          await Workspace.getWorkspaceById(corpus.workspace, user).orFail(
            new NotAuthorizedError()
          )
        } else {
          if (token?.admin === true) {
            return [corpus]
          }
          // permission: make sure that the corpus belongs to the user
          if (corpus.creator.toString() !== userId) {
            throw new NotAuthorizedError()
          }
        }

        return [corpus]
      }

      if (workspaceIdFilter) {
        // permission: make sure that the user belongs to the workspace
        await Workspace.getWorkspaceById(workspaceIdFilter, user).orFail(
          new NotFoundError('Workspace', workspaceIdFilter)
        )

        return Corpus.find({ workspace: workspaceIdFilter })
          .populate([{ path: 'creator' }])
          .sort([['updatedAt', -1]])
      }

      // personal corpus
      return Corpus.find({ creator: userId, workspace: workspaceIdFilter })
        .populate([{ path: 'creator' }])
        .sort([['updatedAt', -1]])
    },

    async sharedCorpus(_, args) {
      return getCorpus(args.corpusId)
    },
  },

  Corpus: {
    async articles(corpus, _args, context) {
      const articles = (
        await Promise.all(
          corpus.articles
            .map(async (article) => {
              const articleLoaded = await context.loaders.articles.load(
                article.article
              )
              if (articleLoaded === undefined) {
                logger.warn(
                  `Unable to find article ${article.article} on corpus ${corpus._id}`
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

      return corpus
    },

    async update(corpus, { updateCorpusInput }) {
      const name = updateCorpusInput.name
      if (name !== undefined && name !== null) {
        corpus.name = name
      }
      const description = updateCorpusInput.description
      if (description !== undefined && description !== null) {
        corpus.description = description
      }
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
