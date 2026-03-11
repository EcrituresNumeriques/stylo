/**
 * Transforms a list of structured articles into a backup JSON object keyed by article ID.
 *
 * @param {Array<{id: string, info: object, latest: object, versions: object}>} articles - Structured articles (as returned by `getArticles`)
 * @returns {{ articles: object }} Backup object with the following shape:
 * {
 *   articles: {
 *     "<articleId>": {
 *       info: { title, creator, contributors, tags, ... },
 *       latest: {
 *         article: "<md content>",
 *         bibliography: "<bib content>",
 *         metadata: {}
 *       },
 *       "<version>.<revision>": {
 *         info: { creator, message },
 *         article: "<md content>",
 *         bibliography: "<bib content>",
 *         metadata: {}
 *       }
 *     }
 *   }
 * }
 */
function json(articles) {
  return {
    articles: articles.reduce((acc, article) => {
      acc[article.id] = {
        info: article.info,
        latest: article.latest,
        ...article.versions,
      }
      return acc
    }, {}),
  }
}

module.exports = { json }
