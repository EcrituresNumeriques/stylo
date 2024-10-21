const convict = require('convict')
require('dotenv').config({ path: '../stylo.env' })

convict.addFormat(require('convict-format-with-validator').url)

/**
 * @type {convict.Config<{
 *
 * }>}
 */
module.exports = convict({
  export: {
    baseUrl: {
      format: 'url',
      env: 'EXPORT_CANONICAL_BASE_URL',
      default: 'http://127.0.0.1:3060'
    },
    urlEndpoint: {
      format: 'url',
      env: 'SNOWPACK_PUBLIC_PANDOC_EXPORT_ENDPOINT',
      default: 'http://127.0.0.1:3080'
    }
  },
  mongo: {
    db: {
      format: String,
      env: 'MONGO_SERVER_DB',
      default: 'stylo-dev'
    },
    host: {
      format: String,
      env: 'MONGO_SERVER',
      default: '127.0.0.1'
    },
    port: {
      format: 'port',
      env: 'MONGO_SERVER_PORT',
      default: '27027'
    }
  },
  oauthProvider: {
    name: {
      format: String,
      env: 'OPENID_CONNECT_NAME',
      default: null,
    },
    issuer: {
      format: 'url',
      env: 'OPENID_CONNECT_ISSUER',
      default: null,
    },
    callbackUrl: {
      format: 'url',
      env: 'OPENID_CONNECT_CALLBACK_URL',
      default: 'http://localhost:3000/authorization-code/callback'
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
        default: null,
      },
      userInfo: {
        format: 'url',
        env: 'OPENID_CONNECT_USER_INFO_URL',
        default: null,
      },
      url: {
        format: 'url',
        env: 'OPENID_CONNECT_AUTH_URL',
        default: null
      }
    }
  },
  port: {
    format: 'port',
    env: 'PORT',
    default: 3030
  },
  securedCookie: {
    format: Boolean,
    env: 'HTTPS',
    default: false
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
        default: null,
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
      format: 'url',
      env: 'ZOTERO_ACCESS_TOKEN_ENDPOINT',
      default: 'https://www.zotero.org/oauth/access'
    },
    authorize: {
      format: 'url',
      env: 'ZOTERO_AUTHORIZE_ENDPOINT',
      default: 'https://www.zotero.org/oauth/authorize'
    },
    requestToken: {
      format: 'url',
      env: 'ZOTERO_REQUEST_TOKEN_ENDPOINT',
      default: 'https://www.zotero.org/oauth/request'
    },
    auth: {
      callbackUrl: {
        format: 'url',
        env: 'ZOTERO_AUTH_CALLBACK_URL',
        default: 'http://localhost:3030/authorization-code/zotero/callback'
      },
      clientKey: {
        format: String,
        sensitive: true,
        env: 'ZOTERO_AUTH_CLIENT_KEY',
        default: null
      },
      clientSecret: {
        format: String,
        sensitive: true,
        env: 'ZOTERO_AUTH_CLIENT_SECRET',
        default: null
      }
    }
  }
})
