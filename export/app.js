const express = require('express');
const mongoose = require('mongoose');

const app = express();

//Look for environnement variables
const mongoServer = process.env.MONGO_SERVER || localhost
const mongoServerPort = process.env.MONGO_SERVER_PORT || 27017
const mongoServerDB = process.env.MONGO_SERVER_DB || 'graphql'
const listenPort = process.env.NODE_ENV === "Dev" ? 3060:80
const redirect = process.env.URL_FRONTEND || 'http://localhost:3000'


app.get('/htmlVersion/:id',(req,res,next)=>res.send('<p>export</p>'));
app.get('/htmlArticle/:id',(req,res,next)=>res.send('<p>export</p>'));
app.get('/zipVersion/:id',(req,res,next)=>res.send('<p>export</p>'));
app.get('/zipArticle/:id',(req,res,next)=>res.send('<p>export</p>'));

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
