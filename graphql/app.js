const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors')

const graphQlSchema = require('./schema/index');
const graphQlResolvers = require('./resolvers/index');

const isAuth = require('./middleware/isAuth')
const displayUser = require('./middleware/displayUser')

const app = express();

//Look for environnement variables
const mongoServer = process.env.MONGO_SERVER || localhost
const mongoServerPort = process.env.MONGO_SERVER_PORT || 27017
const mongoServerDB = process.env.MONGO_SERVER_DB || 'graphql'
const listenPort = process.env.NODE_ENV === "Dev" ? 3030:80
const origin = process.env.ALLOW_CORS_FRONTEND || 'http://localhost:3000'

const corsOptions = {
  origin: origin,
  optionsSuccessStatus: 200,
  credentials: true,
}


app.use(cors(corsOptions))

app.use(bodyParser.json({limit:'50mb'}));
app.use(cookieParser());
app.use(isAuth);
app.use(displayUser);



app.use(
  '/graphql',
  graphqlHttp((req,res) => ({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
    context: {req,res}
  }))
);

mongoose
  .connect(`mongodb://${mongoServer}:${mongoServerPort}/${mongoServerDB}`, {useNewUrlParser: true})
  .then(() => {
    app.listen(listenPort);
  })
  .catch(err => {
    console.log(err);
  });
