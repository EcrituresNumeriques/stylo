const mongoose = require('mongoose')
const migrate = require('db-migrate')

const databaseUrl = global.__MONGO_URI__ + 'stylo-tests'

beforeAll(async () => {
  const migrateInstance = migrate.getInstance(true, {
    env: 'dev',
    config: {
      dev: {
        url: global.__MONGO_URI__ + 'stylo-tests',
        overwrite: {
          driver: {
            require: '@ggrossetie/db-migrate-mongodb',
          },
        },
      },
    },
  })
  migrateInstance.silence(true)
  await migrateInstance.reset()
  await migrateInstance.up()
})

beforeAll(async () => {
  mongoose.set('strictQuery', false)
  globalThis.__MONGO__ = await mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  globalThis.__MONGO_SESSION__ =
    await globalThis.__MONGO__.connection.startSession()
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
