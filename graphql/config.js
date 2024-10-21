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
      env: 'EXPORT_CANONICAL_BASE_URL'
    },
    urlEndpoint: {
      default: 'http://127.0.0.1:3080',
      format: 'url',
      env: 'SNOWPACK_PUBLIC_PANDOC_EXPORT_ENDPOINT'
    }
  },
  mongo: {
    db: {
      default: 'stylo-dev',
      format: String,
      env: 'MONGO_SERVER_DB'
    },
    host: {
      default: '127.0.0.1',
      format: 'ip',
      env: 'MONGO_SERVER'
    },
    port: {
      default: '27027',
      format: 'port',
      env: 'MONGO_SERVER_PORT'
    }
  },
  oauthProvider: {
    name: {
      default: '',
      format: String,
      env: 'OPENID_CONNECT_NAME'
    },
    issuer: {
      default: '',
      format: 'url',
      env: 'OPENID_CONNECT_ISSUER'
    },
    callbackUrl: {
      default: '',
      format: 'url',
      env: 'OPENID_CONNECT_CALLBACK_URL'
    },
    client: {
      id: {
        default: '',
        format: String,
        sensitive: true,
        env: 'OPENID_CONNECT_CLIENT_ID'
      },
      secret: {
        default: '',
        format: String,
        sensitive: true,
        env: 'OPENID_CONNECT_CLIENT_SECRET'
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
        default: '',
      },
      userInfo: {
        format: 'url',
        env: 'OPENID_CONNECT_USER_INFO_URL',
        default: '',
      },
      url: {
        format: 'url',
        env: 'OPENID_CONNECT_AUTH_URL',
        default: ''
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
        env: 'JWT_SECRET_SESSION_COOKIE'
      }
    },
    session: {
      secret: {
        format: String,
        sensitive: true,
        env: 'SESSION_SECRET'
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
        format: String,
        sensitive: true,
        env: 'ZOTERO_AUTH_CLIENT_KEY'
      },
      clientSecret: {
        format: String,
        sensitive: true,
        env: 'ZOTERO_AUTH_CLIENT_SECRET'
      }
    }
  }
})
