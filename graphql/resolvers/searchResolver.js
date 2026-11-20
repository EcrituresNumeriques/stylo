const Article = require('../models/article.js')
const Corpus = require('../models/corpus.js')
const Workspace = require('../models/workspace.js')
const { NotAuthenticatedError } = require('../helpers/errors.js')
const { getWorkspace } = require('./workspaceResolver.js')

module.exports = {
  Query: {
    async search(_root, { query, filter, ...options }, context) {
      const { user, token } = context
      if (!user) {
        throw new NotAuthenticatedError()
      }
      const workspaceId = filter?.workspaceId
      const workspaces = workspaceId
        ? [await getWorkspace(workspaceId, token, user)]
        : await Workspace.findByUser(user)
      // without workspace filter, the user's own articles and corpora too
      const owner = workspaceId ? undefined : user
      const [articles, corpora] = await Promise.all([
        Article.search(query, {
          filter: Article.accessFilter(workspaces, owner),
          ...options,
        }).then((articles) => Article.complete(articles, context.loaders)),
        Corpus.search(query, {
          filter: Corpus.accessFilter(workspaces, owner),
          ...options,
        }).then((corpora) => Corpus.populate(corpora, { path: 'creator' })),
      ])
      return {
        articles: articles.map((article) => ({
          article,
          score: article.score,
        })),
        corpora: corpora.map((corpus) => ({ corpus, score: corpus.score })),
      }
    },
  },
}
