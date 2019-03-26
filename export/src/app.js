const express = require('express');
const mongoose = require('mongoose');

const {exportArticleHtml, exportBookHtml, exportBookZip, exportVersionHtml, exportVersionZip} = require('./export.js')

const app = express();

//Look for environnement variables
const mongoServer = process.env.MONGO_SERVER || localhost
const mongoServerPort = process.env.MONGO_SERVER_PORT || 27017
const mongoServerDB = process.env.MONGO_SERVER_DB || 'graphql'
const listenPort = process.env.NODE_ENV === "Dev" ? 3060:80
const redirect = process.env.URL_FRONTEND || 'http://localhost:3000'


app.get('/htmlVersion/:id',exportVersionHtml);
app.get('/htmlArticle/:id',exportArticleHtml);
app.get('/zipVersion/:id',exportVersionZip);
app.get('/htmlBook/:id',exportBookHtml);
app.get('/zipBook/:id',exportBookZip);

//Duplicate
app.get('/api/v1/htmlVersion/:id',exportVersionHtml);
app.get('/api/v1/htmlArticle/:id',exportArticleHtml);
app.get('/api/v1/zipVersion/:id',exportVersionZip);
app.get('/api/v1/htmlBook/:id',exportBookHtml);
app.get('/api/v1/zipBook/:id',exportBookZip);

app.use((req,res,next)=>{
  return res.redirect(301, redirect+req.originalUrl)
})

mongoose
  .connect(`mongodb://${mongoServer}:${mongoServerPort}/${mongoServerDB}`, {useNewUrlParser: true})
  .then(() => {
    app.listen(listenPort);
  })
  .catch(err => {
    console.log(err);
  });
