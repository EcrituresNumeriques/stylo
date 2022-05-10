const express = require('express')
const cors = require('cors')
const { logger } = require('./logger')
const pino = require('pino-http')({
  logger
})

const { exportArticleHtml, exportArticleZip, exportBookHtml, exportBookZip, exportVersionHtml, exportVersionZip, exportBatchTagZip } = require('./export.js')

const app = express()
app.use(pino)
app.use(cors({
  origin: '*'
}))

const listenPort = process.env.PORT || 3060

const exportRouter = express.Router()
exportRouter.get('/version/:id/html', exportVersionHtml)
exportRouter.get('/version/:id/zip', exportVersionZip)
exportRouter.get('/article/:id/html', exportArticleHtml)
exportRouter.get('/article/:id/zip', exportArticleZip)
exportRouter.get('/book/:id/html', exportBookHtml)
exportRouter.get('/book/:id/zip', exportBookZip)
exportRouter.get('/tag/:ids/zip', exportBatchTagZip)
app.use('/export', exportRouter)

// WARNING: the following routes are used by article/book preview routes to annotate the page.
// the URL is used as an unique identifier and should not be modified otherwise the annotations will be "lost"!
// as a result, we are forced to keep these alias until we use an URL-independent identifier on Hypothesis.
// see: https://web.hypothes.is/help/how-hypothesis-interacts-with-document-metadata/
app.get('/api/v1/htmlVersion/:id', exportVersionHtml)
app.get('/api/v1/htmlArticle/:id', exportArticleHtml)
app.get('/htmlBook/:id', exportBookHtml)
app.get('/api/v1/htmlBook/:id', exportBookHtml)

app.use(function errorHandler (error, req, res, next) {
  if (!error) {
    return next()
  }

  if (error.name === 'FindByIdNotFoundError') {
    return res.status(404).send({ error: { message: error.message } })
  }

  logger.error({ cause: error }, 'Something went wrong!')
  return res.status(500).send({ error })
})

logger.info('Listening on http://localhost:%s', listenPort)
app.listen(listenPort)
