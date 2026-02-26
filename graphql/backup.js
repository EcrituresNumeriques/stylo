const Article = require('./models/article')
const { createLoaders } = require('./loaders')
const Workspace = require('./models/workspace')
const Version = require('./models/version')
const mongoose = require('mongoose')

/**
 * Error thrown when the backup request contains invalid parameters.
 * Carries an HTTP status code of 400 (Bad Request) for use in API error responses.
 */
class BackupValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'BackupValidationError'
    this.status = 400
  }
}

/**
 * Resolves or strips article versions in-place, based on the given strategy.
 *
 * - `"latest"`: removes the `versions` array from each article (the working version is sufficient).
 * - `"all"`: replaces each article's version IDs with the fully resolved `Version` documents.
 *
 * @param {Array} articles - List of articles to mutate
 * @param {'latest' | 'all'} versions - Version retrieval strategy
 * @returns {Promise<void>}
 * @throws {BackupValidationError} If `versions` is not `"latest"` or `"all"`
 */
async function retrieveVersions(articles, versions) {
  if (versions === 'all') {
    for (const article of articles) {
      const versions = article.versions
      article.versions = await Promise.all(
        versions.map(
          async (versionId) =>
            await Version.findById(new mongoose.Types.ObjectId(versionId))
        )
      )
    }
  } else if (versions === 'latest') {
    for (const article of articles) {
      delete article.versions
    }
  } else {
    throw new BackupValidationError(
      `Invalid versions "${versions}": must be one of "latest" or "all".`
    )
  }
}

/**
 * Returns a list of articles for backup purposes, based on the given scope.
 *
 * - `"mine"`: articles owned by or contributed to by the user.
 * - `"workspace"`: articles belonging to a specific workspace (requires `workspaceId`).
 * - `"all"`: union of `"mine"` and all workspace articles for the user.
 *
 * In all cases, the owner and contributors are reduced to `{ _id, email, username }` and the `workingVersion.ydoc` field is stripped from each article.
 *
 * @param {object} config
 * @param {'mine' | 'workspace' | 'all'} [config.scope='mine'] - Scope of the backup
 * @param {string} config.userId - ID of the requesting user
 * @param {string} [config.workspaceId] - Required when scope is `"workspace"`
 * @param {'latest' | 'all'} [config.versions='latest'] - Version retrieval strategy:
 *   `"latest"` strips the version history (working version only);
 *   `"all"` resolves and includes the full version history.
 * @returns {Promise<Array>} Resolved list of articles
 * @throws {BackupValidationError} If scope or versions value is invalid, or `workspaceId` is missing for scope `"workspace"`
 */
async function backup(config) {
  const { scope = 'mine', userId, versions = 'latest' } = config
  const loaders = createLoaders()
  let articles
  if (scope === 'mine') {
    articles = await Article.getArticles({
      filter: {
        $or: [
          { owner: userId },
          { contributors: { $elemMatch: { user: userId } } },
        ],
      },
      loaders: loaders,
    })
  } else if (scope === 'workspace') {
    const { workspaceId } = config
    if (typeof workspaceId !== 'string' || workspaceId === '') {
      throw new BackupValidationError(
        `A workspace identifier is required when scope is "workspace".`
      )
    }
    const workspace = await Workspace.findById(workspaceId, 'articles').lean()
    articles = await Article.getArticles({
      filter: {
        _id: { $in: [...workspace.articles] },
      },
      loaders: loaders,
    })
  } else if (scope === 'all') {
    const userArticles = await Article.getArticles({
      filter: {
        $or: [
          { owner: userId },
          { contributors: { $elemMatch: { user: userId } } },
        ],
      },
      loaders: loaders,
    })
    const workspaces = await Workspace.findByUser({ _id: userId })
    const workspaceArticleIds = workspaces.flatMap((w) => w.articles)
    const workspaceArticles = await Article.getArticles({
      filter: {
        _id: { $in: [...workspaceArticleIds] },
      },
      loaders: loaders,
    })
    articles = [...userArticles, ...workspaceArticles]
  } else {
    throw new BackupValidationError(
      `Invalid scope "${scope}": must be one of "mine", "workspace", or "all".`
    )
  }
  for (const article of articles) {
    const { _id, email, username } = article.owner
    article.owner = {
      _id,
      email,
      username,
    }
    delete article.workingVersion.ydoc
    for (const tag of article.tags) {
      delete tag.articles
    }
    const contributors = article.contributors
    article.contributors = contributors.map((contributor) => {
      const { user, roles } = contributor
      const { _id, email, username } = user
      return {
        user: {
          _id,
          email,
          username,
        },
        roles,
      }
    })
  }
  await retrieveVersions(articles, versions)
  return articles
}

module.exports = {
  backup,
  BackupValidationError,
}
