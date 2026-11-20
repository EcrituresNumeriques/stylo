const { basename, extname } = require('node:path')
const { Readable } = require('node:stream')
const mongoose = require('mongoose')

const config = require('../config.js')
const Attachment = require('../models/attachment.js')
const { getArticleByUser } = require('../resolvers/articleResolver.js')
const {
  allowedContentTypes,
  createWebdavClient,
} = require('../helpers/webdav.js')
const { logger } = require('../logger.js')

const maxAge = 3600

/**
 * @param {import('express').Response} res
 * @param {number} status
 * @param {string} error
 * @param {string} message
 */
function sendError(res, status, error, message) {
  return res.status(status).json({ status, error, message })
}

/**
 * `stats — bureau@1x.png` → `stats — bureau`
 *
 * @param {string} filename
 * @returns {string}
 */
function toAlt(filename) {
  return basename(filename, extname(filename))
    .replace(/@\d+x$/, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

/**
 * @param {string} id
 * @returns {string}
 */
function toAttachmentUrl(id) {
  return new URL(
    `graphql/attachments/${id}`,
    `${config.get('attachments.baseUrl').replace(/\/?$/, '/')}`
  ).toString()
}

/**
 * POST /graphql/attachments?articleId=…&name=…, the file being the raw request body.
 *
 * @type {import('express').RequestHandler}
 */
async function uploadHandler(req, res) {
  const user = req.user
  if (!user) {
    return sendError(res, 401, 'UNAUTHORIZED', 'A valid JWT token is required.')
  }

  const contentType = req.get('content-type')
  if (!allowedContentTypes.has(contentType) || !Buffer.isBuffer(req.body)) {
    return sendError(
      res,
      415,
      'UNSUPPORTED_MEDIA_TYPE',
      'Only raster images are accepted.'
    )
  }

  const name = basename(String(req.query.name ?? ''))
  if (!name || name.startsWith('.')) {
    return sendError(res, 400, 'BAD_REQUEST', 'A file name is required.')
  }

  const articleId = String(req.query.articleId ?? '')
  const article = mongoose.isValidObjectId(articleId)
    ? await getArticleByUser(articleId, user._id).catch(() => null)
    : null
  if (!article) {
    return sendError(res, 404, 'NOT_FOUND', 'Article not found.')
  }

  const account = user.authProviders?.get('webdav')
  if (!account?.url) {
    return sendError(
      res,
      409,
      'NO_STORAGE',
      'No storage account is configured.'
    )
  }

  const folder = article.attachmentsFolder()
  const path = article.attachmentPath(name)

  try {
    const client = createWebdavClient(account)
    await client.ensureCollection(folder)
    const { etag } = await client.put(path, req.body, contentType)

    const attachment = await Attachment.findOneAndUpdate(
      { storageOwner: user._id, path },
      {
        $set: {
          uploadedBy: user._id,
          scope: article.attachmentsScope(),
          scopeId: article._id,
          contentType,
          size: req.body.length,
          etag,
        },
      },
      { upsert: true, returnDocument: 'after' }
    )

    const id = attachment._id.toString()
    const url = toAttachmentUrl(id)
    const alt = toAlt(name)
    const markdown = `![${alt.replace(/([[\]\\])/g, '\\$1')}](${url})`

    return res.status(201).json({ id, url, alt, markdown })
  } catch (error) {
    logger.warn({ err: error, userId: user._id }, 'attachment upload failed')
    return sendError(
      res,
      502,
      'STORAGE_ERROR',
      'The storage account rejected the upload.'
    )
  }
}

/**
 * GET /graphql/attachments/:attachmentId, public.
 *
 * @type {import('express').RequestHandler}
 */
async function readHandler(req, res) {
  const { attachmentId } = req.params
  if (!mongoose.isValidObjectId(attachmentId)) {
    return res.sendStatus(404)
  }

  const attachment = await Attachment.findOneAndUpdate(
    { _id: attachmentId },
    { $inc: { accessCount: 1 }, $set: { lastAccessedAt: Date.now() } }
  ).populate('storageOwner', 'authProviders')

  const account = attachment?.storageOwner?.authProviders?.get('webdav')
  if (!account?.url) {
    return res.sendStatus(404)
  }

  try {
    const upstream = await createWebdavClient(account).get(attachment.path, {
      ifNoneMatch: req.get('if-none-match'),
    })

    if (upstream.status === 404) {
      return res.sendStatus(404)
    }

    if (upstream.status !== 200 && upstream.status !== 304) {
      logger.warn(
        { status: upstream.status, attachmentId },
        'attachment read failed'
      )
      return res.sendStatus(502)
    }

    const contentType =
      upstream.headers.get('content-type') ?? attachment.contentType
    if (upstream.status === 200 && !allowedContentTypes.has(contentType)) {
      return res.sendStatus(415)
    }

    res.set({
      'cache-control': `public, max-age=${maxAge}`,
      'content-security-policy': "default-src 'none'; sandbox",
      'x-content-type-options': 'nosniff',
    })
    for (const header of ['etag', 'last-modified']) {
      const value = upstream.headers.get(header)
      if (value) res.set(header, value)
    }

    if (upstream.status === 304) {
      return res.sendStatus(304)
    }

    res.set({
      'content-type': contentType,
      'content-disposition': `inline; filename*=UTF-8''${encodeURIComponent(basename(attachment.path))}`,
    })
    const length = upstream.headers.get('content-length')
    if (length) res.set('content-length', length)

    Readable.fromWeb(upstream.body).pipe(res)
  } catch (error) {
    logger.warn({ err: error, attachmentId }, 'attachment read failed')
    return res.sendStatus(502)
  }
}

module.exports = {
  readHandler,
  toAlt,
  uploadHandler,
}
