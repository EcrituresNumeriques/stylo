const mongoose = require('mongoose')

const { zip } = require('./zip')
const { json } = require('./json')
const Article = require('../models/article')
const { createLoaders } = require('../loaders')
const Workspace = require('../models/workspace')
const Version = require('../models/version')

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
 * Express request handler for the backup endpoint.
 *
 * Expects a JSON body with:
 * - `scope` (`'mine' | 'workspace' | 'all'`, default `'mine'`)
 * - `versions` (`'latest' | 'all'`, default `'latest'`)
 * - `format` (`'json' | 'zip'`, default `'json'`)
 * - `workspaceId` (string, required when `scope` is `'workspace'`)
 * - `userId` (string, admin only — overrides the authenticated user)
 *
 * Responds with:
 * - `200` JSON backup or ZIP attachment
 * - `400` on invalid parameters
 * - `401` if unauthenticated
 * - `403` if a non-admin requests a backup for another user
 * - `500` on unexpected errors
 */
async function requestHandler(req, res) {
  const user = req.user
  if (!user) {
    return res.status(401).json({
      status: 401,
      error: 'UNAUTHORIZED',
      message: 'A valid JWT token is required.',
    })
  }
  const config = req.body
  const isAdmin = req.token.admin ?? false
  if (!isAdmin && typeof config.userId === 'string' && config.userId !== '') {
    return res.status(403).json({
      status: 403,
      error: 'FORBIDDEN',
      message: 'Only administrators can request a backup for a specific user.',
    })
  }
  try {
    const format = validateFormat(config)
    const articles = await getArticles({
      userId: user._id,
      ...config,
    })
    if (format === 'json') {
      const body = JSON.stringify(json(articles))
      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="backup.json"',
        'Content-Length': Buffer.byteLength(body),
      })
      res.status(200).send(body)
    } else {
      const buffer = await zip(articles)
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="backup.zip"',
        'Content-Length': buffer.length,
      })
      res.send(buffer)
    }
  } catch (error) {
    const status = error instanceof BackupValidationError ? 400 : 500
    const code = status === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR'
    const message =
      status === 400
        ? error.message
        : 'An unexpected error occurred while processing the backup request.'
    res.status(status).json({
      status,
      error: code,
      message,
    })
  }
}

/**
 * Validates and returns the backup format from the request config.
 *
 * Defaults to `"json"` if no format is provided.
 *
 * @param {object} config - Request body config
 * @param {'json' | 'zip' | undefined} config.format - Requested format
 * @returns {'json' | 'zip'} The validated format
 * @throws {BackupValidationError} If the format is not `"json"` or `"zip"`
 */
function validateFormat(config) {
  const format = config.format || 'json'
  if (format === 'zip' || format === 'json') {
    return format
  }
  throw new BackupValidationError(
    `Invalid format "${format}": must be one of "zip", or "json".`
  )
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
            await Version.findById(
              new mongoose.Types.ObjectId(versionId)
            ).populate('owner')
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
 * Retrieves and structures articles for backup, based on the given scope.
 *
 * - `"mine"`: articles owned by or contributed to by the user.
 * - `"workspace"`: articles belonging to a specific workspace (requires `workspaceId`).
 * - `"all"`: union of `"mine"` and all workspace articles for the user.
 *
 * Owner and contributors are reduced to `{ _id, email, username }`. Tags are stripped
 * of their `articles` back-reference. `workingVersion.ydoc` is removed.
 *
 * Each article is returned as a structured object:
 * ```
 * {
 *   id: string,
 *   info: { title, creator, contributors, tags, zoteroLink, nakalaLink, createdAt, updatedAt },
 *   latest: { article, bibliography, metadata },
 *   versions: {
 *     "<version>.<revision>": { info: { creator, message }, article, bibliography, metadata }
 *   }
 * }
 * ```
 * When `versions` is `"latest"`, the `versions` object is empty (`{}`).
 *
 * @param {object} config
 * @param {'mine' | 'workspace' | 'all'} [config.scope='mine'] - Scope of the backup
 * @param {string} config.userId - ID of the requesting user
 * @param {string} [config.workspaceId] - Required when scope is `"workspace"`
 * @param {'latest' | 'all'} [config.versions='latest'] - Version retrieval strategy:
 *   `"latest"` returns an empty `versions` object; `"all"` populates it with the full version history.
 * @returns {Promise<Array<{id: string, info: object, latest: object, versions: object}>>} Structured article list
 * @throws {BackupValidationError} If scope or versions value is invalid, or `workspaceId` is missing for scope `"workspace"`
 */
async function getArticles(config) {
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
      id: _id,
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
          id: _id,
          email,
          username,
        },
        roles,
      }
    })
  }
  await retrieveVersions(articles, versions)
  return articles.map((article) => {
    const id = String(article._id)
    const wv = article.workingVersion ?? {}
    const versions = article.versions ?? []
    const history = versions.reduce((acc, version) => {
      acc[`${version.version}.${version.revision}`] = {
        info: {
          creator: {
            id: version.owner._id,
            email: version.owner.email,
            username: version.owner.username,
          },
          message: version.message,
        },
        article: version.md ?? '',
        bibliography: version.bib ?? '',
        metadata: version.metadata ?? {},
      }
      return acc
    }, {})

    return {
      id,
      info: {
        title: article.title,
        creator: article.owner,
        contributors: article.contributors,
        tags: article.tags,
        zoteroLink: article.zoteroLink,
        nakalaLink: article.nakalaLink,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      },
      latest: {
        article: wv.md ?? '',
        bibliography: wv.bib ?? '',
        metadata: wv.metadata ?? {},
      },
      versions: history,
    }
  })
}

module.exports = {
  requestHandler,
}
