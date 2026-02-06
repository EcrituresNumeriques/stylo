const { MongoDBContainer } = require('@testcontainers/mongodb')
const mongoose = require('mongoose')
const migrate = require('db-migrate')

async function setup() {
  const container = await new MongoDBContainer('mongo:7.0.29').start()
  const migrateInstance = migrate.getInstance(true, {
    env: 'dev',
    config: {
      dev: {
        url: container.getConnectionString() + '/stylo-tests',
        options: {
          directConnection: true,
        },
        overwrite: {
          driver: {
            require: '@ggrossetie/db-migrate-mongodb',
          },
        },
      },
    },
  })
  migrateInstance.silence(false)
  await migrateInstance.reset()
  await migrateInstance.up()
  mongoose.set('strictQuery', true)
  await mongoose.connect(container.getConnectionString() + '/stylo-tests', {
    directConnection: true,
  })
  return container
}

async function teardown(container) {
  await mongoose.disconnect()
  await container.stop()
}

module.exports = {
  teardown,
  setup,
}
