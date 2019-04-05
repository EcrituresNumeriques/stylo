const mongoose = require('mongoose');
const migrate = require('./migrate')

//Look for environnement variables
const mongoServer = process.env.MONGO_SERVER || localhost
const mongoServerPort = process.env.MONGO_SERVER_PORT || 27017
const mongoServerDB = process.env.MONGO_SERVER_DB || 'migrate'

mongoose
  .connect(`mongodb://${mongoServer}:${mongoServerPort}/${mongoServerDB}`, {useNewUrlParser: true})
  .then(async () => {
    //Migrate DB
    console.log(`migrating to mongodb://${mongoServer}:${mongoServerPort}/${mongoServerDB}`);
    migrate().then((ret)=>{
      console.log(ret)
      process.exit()
    });
  })
  .catch(err => {
    console.log(err);
  });
