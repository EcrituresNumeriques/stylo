import migrate from 'db-migrate'
import mongoose from 'mongoose'
import { GenericContainer, Wait } from 'testcontainers'

const MONGODB_PORT = 27017

async function setup() {
  const container = await new GenericContainer('mongo:7.0.29')
    .withExposedPorts(MONGODB_PORT)
    .withStartupTimeout(120_000)
    .withWaitStrategy(Wait.forLogMessage(/[Ww]aiting for connections/))
    .start()

  const connectionString = `mongodb://${container.getHost()}:${container.getMappedPort(MONGODB_PORT)}`

  const migrateInstance = migrate.getInstance(true, {
    env: 'dev',
    config: {
      dev: {
        url: `${connectionString}/stylo-tests`,
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
  await mongoose.connect(`${connectionString}/stylo-tests`, {
    directConnection: true,
  })
  return container
}

async function teardown(container) {
  await mongoose.disconnect()
  await container.stop()
}

export { setup, teardown }
