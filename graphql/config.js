const convict = require('convict')
const assert = require('node:assert/strict')
require('dotenv').config({ path: '../stylo.env' })

const isURL = require('validator/lib/isURL')

convict.addFormat(require('convict-format-with-validator').url)
convict.addFormat({
  name: 'mongodb-url',
  coerce: (v) => v.toString(),
  validate: (val) => assert.ok(isURL(val, { require_tld: false, protocols: ['mongodb', 'mongodb+srv'] }), 'must be a mongodb protocol URL')

})
/**
 * @type {convict.Config<{
 *
 * }>}
 */
module.exports = convict({
  export: {
    baseUrl: {
      default: 'http://127.0.0.1:3060',
      format: 'url',
      env: 'EXPORT_CANONICAL_BASE_URL'
    },
    urlEndpoint: {
      default: 'http://127.0.0.1:3080',
      format: 'url',
      env: 'SNOWPACK_PUBLIC_PANDOC_EXPORT_ENDPOINT'
    }
  },
  mongo: {
    databaseUrl: {
      default: 'mongodb://127.0.0.1:27017/stylo-dev',
      format: 'mongodb-url',
      env: 'DATABASE_URL'
    }
  },
  oauthProvider: {
    name: {
      format: String,
      env: 'OPENID_CONNECT_NAME',
      default: null
    },
    issuer: {
      format: 'url',
      env: 'OPENID_CONNECT_ISSUER',
      default: null
    },
    callbackUrl: {
      format: 'url',
      env: 'OPENID_CONNECT_CALLBACK_URL',
      default: null
    },
    client: {
      id: {
        format: String,
        sensitive: true,
        env: 'OPENID_CONNECT_CLIENT_ID',
        default: null
      },
      secret: {
        format: String,
        sensitive: true,
        env: 'OPENID_CONNECT_CLIENT_SECRET',
        default: null
      }
    },
    scope: {
      default: 'profile email',
      env: 'OPENID_CONNECT_SCOPE'
    },
    auth: {
      tokenUrl: {
        format: 'url',
        env: 'OPENID_CONNECT_TOKEN_URL',
        default: null
      },
      userInfo: {
        format: 'url',
        env: 'OPENID_CONNECT_USER_INFO_URL',
        default: null
      },
      url: {
        format: 'url',
        env: 'OPENID_CONNECT_AUTH_URL',
        default: null
      }
    }
  },
  port: {
    default: 3030,
    format: 'port',
    env: 'PORT'
  },
  securedCookie: {
    format: Boolean,
    default: false,
    env: 'HTTPS'
  },
  security: {
    cors: {
      origin: {
        // url1 url2
        default: 'http://127.0.0.1:3000 http://127.0.0.1:3030',
        env: 'ALLOW_CORS_FRONTEND'
      }
    },
    jwt: {
      secret: {
        format: String,
        sensitive: true,
        env: 'JWT_SECRET_SESSION_COOKIE',
        default: null
      }
    },
    session: {
      secret: {
        format: String,
        sensitive: true,
        env: 'SESSION_SECRET',
        default: null
      }
    }
  },
  zotero: {
    accessPoint: {
      default: 'https://www.zotero.org/oauth/access',
      format: 'url',
      env: 'ZOTERO_ACCESS_TOKEN_ENDPOINT'
    },
    authorize: {
      default: 'https://www.zotero.org/oauth/authorize',
      format: 'url',
      env: 'ZOTERO_AUTHORIZE_ENDPOINT'
    },
    requestToken: {
      default: 'https://www.zotero.org/oauth/request',
      format: 'url',
      env: 'ZOTERO_REQUEST_TOKEN_ENDPOINT'
    },
    auth: {
      callbackUrl: {
        format: 'url',
        env: 'ZOTERO_AUTH_CALLBACK_URL'
      },
      clientKey: {
        default: null,
        format: String,
        sensitive: true,
        env: 'ZOTERO_AUTH_CLIENT_KEY'
      },
      clientSecret: {
        default: null,
        format: String,
        sensitive: true,
        env: 'ZOTERO_AUTH_CLIENT_SECRET'
      }
    }
  }
})
