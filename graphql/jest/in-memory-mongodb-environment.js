// in-memory-mongodb-environment
const { MongoMemoryServer } = require('mongodb-memory-server')
const NodeEnvironment = require('jest-environment-node').TestEnvironment

class InMemoryMongoDBEnvironment extends NodeEnvironment {
  constructor (config, context) {
    super(config, context)
  }

  async setup () {
    await super.setup()
  }

  async teardown () {
    await super.teardown()
  }

  getVmContext () {
    return super.getVmContext()
  }

  async handleTestEvent (event) {
    if (event.name === 'test_start') {
      const mongod = await MongoMemoryServer.create()
      this.mongod = mongod
      const uri = mongod.getUri()
      this.global.mongoose.set('useNewUrlParser', true)
      this.global.mongoose.set('useUnifiedTopology', true)
      this.global.mongoose.set('useCreateIndex', true)
      await (new Promise((resolve, reject) => {
        this.global.mongoose
          .connect(uri)
          .then(() => {
            resolve({})
          })
          .catch(err => {
            reject(err)
          })
      }))
    } else if (event.name === 'test_done') {
      // The Server can be stopped again with
      if (this.mongod !== undefined) {
        await this.global.mongoose.disconnect()
        await this.mongod.stop()
      }
    }
  }
}

module.exports = InMemoryMongoDBEnvironment
