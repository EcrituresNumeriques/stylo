const mongoose = require('mongoose')
const migrate = require('db-migrate')

mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

const databaseUrl = global.__MONGO_URI__ + 'stylo-tests'

beforeAll(async () => {
  process.env.DATABASE_URL = databaseUrl

  const migrateInstance = migrate.getInstance(true)
  migrateInstance.silence(true)
  await migrateInstance.reset()
  await migrateInstance.up()
})


beforeAll(async () => {
  globalThis.__MONGO__ = await mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  })

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
