const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')

const config = require('./config.js')
config.validate({ allowed: 'strict' })


const express = require('express')
const cors = require('cors')
const { logger } = require('./logger')
const pino = require('pino-http')({
  logger
})

const {
  exportArticleHtml,
  exportArticleZip,
  exportBookHtml,
  exportBookZip,
  exportVersionHtml,
  exportVersionZip,
  exportBatchTagZip
} = require('./export.js')

// inspired by: https://github.com/Abazhenov/express-async-handler/blob/master/index.js
const asyncHandler = fn =>
  function asyncUtilWrap (...args) {
    const fnReturn = fn(...args)
    const next = args[args.length - 1]
    return Promise.resolve(fnReturn).catch(next)
  }

const app = express()
app.use(pino)
app.use(cors({
  origin: '*'
}))

if (config.get('sentry.dsn')) {
  Sentry.init({
    dsn: config.get('sentry.dsn'),
    environment: process.env.NODE_ENV,
    attachStacktrace: true,
    includeLocalVariables: true,
    integrations: [
      nodeProfilingIntegration()
    ]
  })

  Sentry.setupExpressErrorHandler(app)
}

const listenPort = config.get('port')

const asyncExportVersionHtml = asyncHandler(exportVersionHtml)
const asyncExportArticleHtml = asyncHandler(exportArticleHtml)
const asyncExportBookHtml = asyncHandler(exportBookHtml)

const exportRouter = express.Router()
exportRouter.get('/version/:id/html', asyncExportVersionHtml)
exportRouter.get('/version/:id/zip', asyncHandler(exportVersionZip))
exportRouter.get('/article/:id/html', asyncExportArticleHtml)
exportRouter.get('/article/:id/zip', asyncHandler(exportArticleZip))
exportRouter.get('/book/:id/html', asyncExportBookHtml)
exportRouter.get('/book/:id/zip', asyncHandler(exportBookZip))
exportRouter.get('/tag/:ids/zip', asyncHandler(exportBatchTagZip))
app.use('/export', exportRouter)

// WARNING: the following routes are used by article/book preview routes to annotate the page.
// the URL is used as an unique identifier and should not be modified otherwise the annotations will be "lost"!
// as a result, we are forced to keep these alias until we use an URL-independent identifier on Hypothesis.
// see: https://web.hypothes.is/help/how-hypothesis-interacts-with-document-metadata/
app.get('/api/v1/htmlVersion/:id', asyncExportVersionHtml)
app.get('/api/v1/htmlArticle/:id', asyncExportArticleHtml)
app.get('/htmlBook/:id', asyncExportBookHtml)
app.get('/api/v1/htmlBook/:id', asyncExportBookHtml)

app.use(function errorHandler (error, req, res, next) {
  if (!error) {
    return next()
  }

  if (error.name === 'FindByIdNotFoundError') {
    return res.status(404).send({ error: { message: error.message } })
  }
  logger.error({ cause: error }, 'Something went wrong!')
  if (res.headersSent) {
    // no-op
    logger.warn('Headers already sent, aborting.')
    return res.status(500)
  }
  const message = error.message
  const stack = error.stack
  const type = error.constructor && error.constructor.name
  const errorInfo = {
    type,
    message,
    stack
  }
  return res.status(500).send({ error: errorInfo })
})

logger.info('Listening on http://localhost:%s', listenPort)
app.listen(listenPort)
