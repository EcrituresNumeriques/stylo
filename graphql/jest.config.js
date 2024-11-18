/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  preset: '@shelf/jest-mongodb',
  watchPathIgnorePatterns: ['globalConfig'],

  setupFilesAfterEnv: [
    './tests/setup-db.js'
  ],

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
