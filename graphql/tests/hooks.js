const mongoose = require('mongoose')
const databaseUrl = require('../config.js').get('mongo.databaseUrl') + '-tests'

mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)


beforeAll(async () => {
  globalThis.__MONGO__ = await mongoose.connect(databaseUrl)
  console.log(databaseUrl)
  globalThis.__MONGO_SESSION__ = await globalThis.__MONGO__.connection.startSession()
})

afterAll(async () => {
  await globalThis.__MONGO__.disconnect()
})

beforeEach(async () => {
  const { models } = globalThis.__MONGO__

  for await (const model of Object.values(models)) {
    await model.deleteMany({})
  }
})
