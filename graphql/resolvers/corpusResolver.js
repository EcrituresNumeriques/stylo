const {ApiError} = require('../helpers/errors')
const Corpus = require('../models/corpus')

class CorpusArticle {

  constructor(corpus, article) {
    this.corpus = corpus
    this.article = article
  }

  async remove() {
    if (this.article) {
      this.corpus.articles.pull({_id: this.article._id})
      return this.corpus.save()
    }
    return this.corpus
  }

  async move(order) {
    if (this.article) {
      const articles = this.corpus.articles
      const map = new Map(articles.map((obj) => [obj.order, obj]))
      const currentOrder = this.article.order
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
      this.article.order = order
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
    async createCorpus(_, args, {user}) {
      const {createCorpusInput} = args
      if (!user) {
        throw new ApiError('UNAUTHENTICATED', 'Unable to create a corpus as an unauthenticated user')
      }
      // any user can create a corpus
      const newCorpus = new Corpus({
        name: createCorpusInput.name,
        articles: [],
        metadata: createCorpusInput.metadata,
        workspace: createCorpusInput.workspaceId,
        creator: user._id,
      })
      return newCorpus.save()
    },
  },

  Query: {
    /**
     * Get a list of corpus created by the authenticated user
     *
     * @param _
     * @param args
     * @param user
     * @returns {Promise<[Corpus]>}
     */
    async corpus(_, args, {user}) {
      if (!user) {
        throw new ApiError('UNAUTHENTICATED', 'Unable to get a list of corpus as an unauthenticated user')
      }
      return Corpus.find({'creator': user?._id}).lean()
    },
  },

  Corpus: {
    async article(corpus, {articleId}) {
      const article = corpus.articles.find(({article}) => article.id === articleId)
      return new CorpusArticle(corpus, article)
    },

    async rename(corpus, {name}) {
      corpus.name = name
      return corpus.save()
    },

    async updateMetadata(corpus, {metadata}) {
      corpus.metadata = metadata
      return corpus.save()
    },

    async addArticle(corpus, {articleId, order}) {
      const articleAlreadyAdded = corpus.articles.find(({article}) => article.id === articleId)
      if (articleAlreadyAdded) {
        return corpus
      }
      corpus.articles.push({article: {_id: articleId}, order})
      return corpus.save()
    },
  },
}
