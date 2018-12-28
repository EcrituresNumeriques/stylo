const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphQlSchema = require('./schema/index');
const graphQlResolvers = require('./resolvers/index');

const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

mongoose
  .connect('mongodb://localhost:27017/graphql', {useNewUrlParser: true})
  .then(() => {
    app.listen(3030);
  })
  .catch(err => {
    console.log(err);
  });
