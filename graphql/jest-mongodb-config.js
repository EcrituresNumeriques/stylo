module.exports = {
  // @see https://github.com/shelfio/jest-mongodb#readme
  mongodbMemoryServerOptions: {
    autoStart: false,
    binary: {
      version: '4.4.29'
    },
    instance: {
      dbName: 'stylo-tests'
    }
  }
}
