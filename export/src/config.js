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
    default: 3060,
    format: 'port',
    env: 'PORT'
  },
  api: {
    urlEndpoint: {
      default: 'http://localhost:3030/graphql',
      format: 'url',
      env: 'SNOWPACK_PUBLIC_GRAPHQL_ENDPOINT'
    },
    passthroughToken: {
      format: 'string',
      sensitive: true,
      env: 'SE_GRAPHQL_TOKEN'
    }
  },
  export: {
    // legacy option
    canonicalBaseUrl: {
      format: 'url',
      env: 'EXPORT_CANONICAL_BASE_URL'
    },
    urlEndpoint: {
      default: 'http://127.0.0.1:3080',
      format: 'url',
      env: 'SNOWPACK_PUBLIC_PANDOC_EXPORT_ENDPOINT'
    }
  }
})
