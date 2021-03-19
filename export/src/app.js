const express = require('express')
const mongoose = require('mongoose')

const { exportArticleHtml, exportArticleZip, exportBookHtml, exportBookZip, exportVersionHtml, exportVersionZip, exportBatchTagZip } = require('./export.js')

const app = express()

const mongoServer = process.env.MONGO_SERVER || 'localhost'
const mongoServerPort = process.env.MONGO_SERVER_PORT || 27017
const mongoServerDB = process.env.MONGO_SERVER_DB || 'graphql'
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

// WARNING: the following routes are used by https://via.hypothes.is/ to annotate the page.
// the URL is used as an unique identifier and should not be modified otherwise the annotations will be "lost"!
// as a result, we are forced to keep these alias until we use an URL-independent identifier on Hypothesis.
// see: https://web.hypothes.is/help/how-hypothesis-interacts-with-document-metadata/
app.get('/api/v1/htmlVersion/:id', exportVersionHtml)
app.get('/api/v1/htmlArticle/:id', exportArticleHtml)
app.get('/htmlBook/:id', exportBookHtml)

// fix deprecation warnings: https://mongoosejs.com/docs/deprecations.html
mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)

mongoose
  .connect(`mongodb://${mongoServer}:${mongoServerPort}/${mongoServerDB}`)
  .then(() => {
    console.log('Listening on http://localhost:%s', listenPort)
    app.listen(listenPort)
  })
  .catch(err => {
    console.log('Unable to connect to MongoDB', err)
  })
