const Article = require('../models/article.js')
const Corpus = require('../models/corpus.js')
const User = require('../models/user.js')
const Workspace = require('../models/workspace.js')
const pipelines = require('../helpers/statsPipelines.js')

// incorrect, because we also inject it at runtime, based on Git tag
const { version } = require('../package.json')

const CACHE_DURATION_IN_MS = 24 * 60 * 60 * 1000

/** @type {{ expiresAt: number, stats: Promise<object> }|null} */
let cache = null

/**
 * @param {import('mongoose').Model} model
 * @param {object[]} pipeline
 * @returns {Promise<object[]>} the documents returned by the pipeline
 */
function aggregate(model, pipeline) {
  return model.aggregate(pipeline).allowDiskUse(true).exec()
}

/**
 * Computes the instance usage stats: every computation happens in MongoDB.
 *
 * @returns {Promise<object>} the instance usage stats
 */
async function computeStats() {
  const [[users], [articles], activity, retention, [corpora], [workspaces]] =
    await Promise.all([
      aggregate(User, pipelines.users),
      aggregate(Article, pipelines.articles),
      aggregate(Article, pipelines.activity),
      aggregate(Article, pipelines.retention),
      aggregate(Corpus, pipelines.corpora),
      aggregate(Workspace, pipelines.workspaces),
    ])
  return {
    version,
    computedAt: new Date(),
    users,
    articles,
    activity,
    retention,
    corpora,
    workspaces,
  }
}

/**
 * Returns the instance usage stats, computed at most once a day.
 * Concurrent calls share the same computation; a failed computation is not cached.
 *
 * @param {number} [now]
 * @returns {Promise<object>} the instance usage stats
 */
function getStats(now = Date.now()) {
  if (cache === null || cache.expiresAt <= now) {
    const entry = { expiresAt: now + CACHE_DURATION_IN_MS, stats: null }
    entry.stats = computeStats().catch((error) => {
      if (cache === entry) {
        cache = null
      }
      throw error
    })
    cache = entry
  }
  return cache.stats
}

function clearStatsCache() {
  cache = null
}

module.exports = {
  CACHE_DURATION_IN_MS,
  clearStatsCache,
  getStats,

  Query: {
    stats() {
      return getStats()
    },
  },
}
