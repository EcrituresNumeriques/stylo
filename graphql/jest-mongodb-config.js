module.exports = {
  // @see https://github.com/shelfio/jest-mongodb#readme
  mongodbMemoryServerOptions: {
    autoStart: false,
    binary: {
      version: '5.0.31',
    },
    instance: {
      dbName: 'stylo-tests',
    },
  },
}
