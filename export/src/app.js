const express = require('express')
const mongoose = require('mongoose')

const { exportArticleHtml, exportArticleZip, exportBookHtml, exportBookZip, exportVersionHtml, exportVersionZip, exportBatchTagZip } = require('./export.js')

const app = express()

const mongoServer = process.env.MONGO_SERVER || 'localhost'
const mongoServerPort = process.env.MONGO_SERVER_PORT || 27017
const mongoServerDB = process.env.MONGO_SERVER_DB || 'graphql'
const listenPort = process.env.PORT || 3060
const redirect = process.env.URL_FRONTEND || 'http://localhost:3000'

const exportRouter = express.Router()
exportRouter.get('/version/:id/html', exportVersionHtml)
exportRouter.get('/version/:id/zip', exportVersionZip)
exportRouter.get('/article/:id/html', exportArticleHtml)
exportRouter.get('/article/:id/zip', exportArticleZip)
exportRouter.get('/book/:id/html', exportBookHtml)
exportRouter.get('/book/:id/zip', exportBookZip)
exportRouter.get('/tag/:ids/zip', exportBatchTagZip)
app.use('/export', exportRouter)

app.use((req, res, _) => {
  return res.redirect(302, redirect + req.originalUrl)
})

// fix deprecation warnings: https://mongoosejs.com/docs/deprecations.html
mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)

mongoose
  .connect(`mongodb://${mongoServer}:${mongoServerPort}/${mongoServerDB}`)
  .then(() => {
    app.listen(listenPort)
  })
  .catch(err => {
    console.log('Unable to connect to MongoDB', err)
  })
