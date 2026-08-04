const { NotFoundError, NotAuthenticatedError } = require('../helpers/errors.js')
const Corpus = require('../models/corpus')
const Workspace = require('../models/workspace')
const { logger } = require('../logger')
const { NotAuthorizedError } = require('../helpers/errors')
const { diff } = require('../helpers/diff')

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
      return this.corpus.removeArticleById(articleRefId(this._article.article))
    }
    return this.corpus
  }

  async move(order) {
    if (this._article) {
      return this.corpus.moveArticle(articleRefId(this._article.article), order)
    }
    return this.corpus
  }
}

/**
 * A corpus article's `article` ref field is normally a bare ObjectId, but
 * some code paths (and fixtures) store the whole Article document instead.
 * Extract the actual article id string in either case.
 */
function articleRefId(article) {
  return String(article?._id ?? article)
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

    async setCorpusArticles(_, args, context) {
      const { articleIds, corpusId } = args.setCorpusArticlesInput
      const corpus = await getCorpusByContext(corpusId, context)
      const initialArticleIds = corpus.articles.map((a) =>
        a.article._id.toString()
      )
      const { toAdd, toDelete } = diff(initialArticleIds, articleIds)
      if (toAdd.size > 0 || toDelete.size > 0) {
        corpus.articles = [
          ...corpus.articles.filter((a) => !toDelete.has(a.article.toString())),
          ...Array.from(toAdd).map((addition) => ({
            article: { _id: addition },
            order: 0,
          })),
        ]
        return corpus.save()
      }
      return corpus
    },

    async deleteCorpus(_, { corpusId }, context) {
      const corpus = await getCorpusByContext(corpusId, context)
      await corpus.deleteOne()
      return corpus
    },

    async renameCorpus(_, { corpusId, name }, context) {
      const corpus = await getCorpusByContext(corpusId, context)
      return corpus.rename(name)
    },

    async updateCorpusMetadata(_, { corpusId, metadata }, context) {
      const corpus = await getCorpusByContext(corpusId, context)
      return corpus.updateMetadata(metadata)
    },

    async updateCorpus(_, { corpusId, updateCorpusInput }, context) {
      const corpus = await getCorpusByContext(corpusId, context)
      return corpus.update(updateCorpusInput)
    },

    async addCorpusArticle(_, { corpusId, articleId }, context) {
      const corpus = await getCorpusByContext(corpusId, context)
      return corpus.addArticleById(articleId)
    },

    async removeCorpusArticle(_, { corpusId, articleId }, context) {
      const corpus = await getCorpusByContext(corpusId, context)
      return corpus.removeArticleById(articleId)
    },

    async moveCorpusArticle(_, { corpusId, articleId, order }, context) {
      const corpus = await getCorpusByContext(corpusId, context)
      return corpus.moveArticle(articleId, order)
    },

    async updateCorpusArticlesOrder(
      _,
      { corpusId, articlesOrderInput },
      context
    ) {
      const corpus = await getCorpusByContext(corpusId, context)
      return corpus.updateArticlesOrder(articlesOrderInput)
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

        // permission: admin token can access any corpus!
        if (token?.admin === true) {
          return [corpus]
        }

        if (corpus.workspace) {
          // permission: make sure that the user belongs to the corpus workspace
          await Workspace.getWorkspaceById(corpus.workspace, user).orFail(
            new NotAuthorizedError()
          )
        } else {
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

    /** @deprecated Use renameCorpus root mutation instead. */
    async rename(corpus, { name }) {
      return corpus.rename(name)
    },

    /** @deprecated Use updateCorpusMetadata root mutation instead. */
    async updateMetadata(corpus, { metadata }) {
      return corpus.updateMetadata(metadata)
    },

    /** @deprecated Use addCorpusArticle root mutation instead. */
    async addArticle(corpus, { articleId, order }) {
      return corpus.addArticleById(articleId, order)
    },

    /** @deprecated Use deleteCorpus root mutation instead. */
    async delete(corpus) {
      await corpus.deleteOne()

      return corpus
    },

    /** @deprecated Use updateCorpus root mutation instead. */
    async update(corpus, { updateCorpusInput }) {
      return corpus.update(updateCorpusInput)
    },

    /** @deprecated Use updateCorpusArticlesOrder root mutation instead. */
    async updateArticlesOrder(corpus, { articlesOrderInput }) {
      return corpus.updateArticlesOrder(articlesOrderInput)
    },
  },
}
