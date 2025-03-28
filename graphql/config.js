const convict = require('convict')
const assert = require('node:assert/strict')
require('dotenv').config({ path: ['.env', '../.env'] })

const isURL = require('validator/lib/isURL')
const ospath = require('node:path')

convict.addFormat(require('convict-format-with-validator').url)
convict.addFormat({
  name: 'mongodb-url',
  coerce: (v) => v.toString(),
  validate: (val) =>
    assert.ok(
      isURL(val, { require_tld: false, protocols: ['mongodb', 'mongodb+srv'] }),
      'must be a mongodb protocol URL'
    ),
})
/**
 * @type {convict.Config<{
 *
 * }>}
 */
module.exports = convict({
  env: {
    format: ['dev', 'prod'],
    env: 'SENTRY_ENVIRONMENT',
    default: 'dev',
  },
  export: {
    baseUrl: {
      format: String,
      env: 'SNOWPACK_PUBLIC_ANNOTATIONS_CANONICAL_BASE_URL',
      default: 'https://stylo.ecrituresnumeriques.ca',
    },
    urlEndpoint: {
      format: 'url',
      env: 'SNOWPACK_PUBLIC_PANDOC_EXPORT_ENDPOINT',
      default: 'http://127.0.0.1:3080',
    },
  },
  mongo: {
    databaseUrl: {
      default: 'mongodb://127.0.0.1:27017/stylo-dev',
      format: 'mongodb-url',
      env: 'DATABASE_URL',
    },
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
      default: 'http://localhost:3000/authorization-code/callback',
    },
    client: {
      id: {
        format: String,
        sensitive: true,
        env: 'OPENID_CONNECT_CLIENT_ID',
        default: null,
      },
      secret: {
        format: String,
        sensitive: true,
        env: 'OPENID_CONNECT_CLIENT_SECRET',
        default: null,
      },
    },
    scope: {
      default: 'profile email',
      env: 'OPENID_CONNECT_SCOPE',
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
        default: null,
      },
    },
  },
  port: {
    format: 'port',
    env: 'PORT',
    default: 3030,
  },
  securedCookie: {
    format: Boolean,
    env: 'HTTPS',
    default: false,
  },
  security: {
    cors: {
      origin: {
        // url1 url2
        default: 'http://127.0.0.1:3000 http://127.0.0.1:3030',
        env: 'ALLOW_CORS_FRONTEND',
      },
    },
    jwt: {
      secret: {
        format: String,
        sensitive: true,
        env: 'JWT_SECRET_SESSION_COOKIE',
        default: null,
      },
    },
    session: {
      secret: {
        format: String,
        sensitive: true,
        env: 'SESSION_SECRET',
        default: null,
      },
    },
  },
  zotero: {
    accessPoint: {
      format: 'url',
      env: 'ZOTERO_ACCESS_TOKEN_ENDPOINT',
      default: 'https://www.zotero.org/oauth/access',
    },
    authorize: {
      format: 'url',
      env: 'ZOTERO_AUTHORIZE_ENDPOINT',
      default: 'https://www.zotero.org/oauth/authorize',
    },
    requestToken: {
      format: 'url',
      env: 'ZOTERO_REQUEST_TOKEN_ENDPOINT',
      default: 'https://www.zotero.org/oauth/request',
    },
    auth: {
      callbackUrl: {
        format: 'url',
        env: 'ZOTERO_AUTH_CALLBACK_URL',
        default: 'http://localhost:3030/authorization-code/zotero/callback',
      },
      clientKey: {
        format: String,
        sensitive: true,
        env: 'ZOTERO_AUTH_CLIENT_KEY',
        default: null,
      },
      clientSecret: {
        format: String,
        sensitive: true,
        env: 'ZOTERO_AUTH_CLIENT_SECRET',
        default: null,
      },
    },
  },
  sentry: {
    dsn: {
      format: 'url',
      env: 'SENTRY_GRAPHQL_DSN',
      default: null,
      nullable: true,
    },
  },
  collaboration: {
    updateWorkingCopyIntervalMs: {
      format: 'int',
      env: 'COLLABORATION_UPDATE_WORKING_COPY_INTERVAL_MS',
      default: 3000,
    },
    editingSessionDataDirectory: {
      format: String,
      env: 'COLLABORATION_EDITING_SESSION_PERSISTENCE_DATA_DIR',
      default: ospath.join(__dirname, 'yeditingsession'),
      nullable: false,
    },
    persistenceDataDirectory: {
      format: String,
      env: 'COLLABORATION_PERSISTENCE_DATA_DIR',
      default: ospath.join(__dirname, 'ydata'),
      nullable: false,
    },
  },
})
