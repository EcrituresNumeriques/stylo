const { MongoDBContainer } = require('@testcontainers/mongodb')
const mongoose = require('mongoose')

async function setup() {
  const container = await new MongoDBContainer('mongo:5.0.31').start()
  mongoose.set('strictQuery', true)
  await mongoose.connect(container.getConnectionString(), {
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
