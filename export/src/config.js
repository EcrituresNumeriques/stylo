const convict = require('convict')
require('dotenv').config({ path: '../../stylo.env' })

convict.addFormat(require('convict-format-with-validator').url)

/**
 * @type {convict.Config<{
 *
 * }>}
 */
module.exports = convict({
  port: {
    format: 'port',
    env: 'PORT',
    default: 3060
  },
  api: {
    urlEndpoint: {
      format: 'url',
      env: 'SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT',
      default: 'http://localhost:3030/graphql'
    },
    passthroughToken: {
      format: String,
      sensitive: true,
      env: 'SE_GRAPHQL_TOKEN',
      default: null
    }
  },
  export: {
    // legacy option
    canonicalBaseUrl: {
      format: String,
      env: 'EXPORT_CANONICAL_BASE_URL',
      default: 'http://127.0.0.1:3060'
    },
    urlEndpoint: {
      format: 'url',
      env: 'SNOWPACK_PUBLIC_PANDOC_EXPORT_ENDPOINT',
      default: 'http://127.0.0.1:3080'
    }
  }
})
