const convict = require('convict')
const assert = require('node:assert/strict')
require('dotenv').config({ path: ['.env', '../.env'] })

const isURL = require('validator/lib/isURL')
const ospath = require('node:path')

convict.addFormat(require('convict-format-with-validator').url)

convict.addFormat({
  name: 'cors-origins',
  coerce(value) {
    return String(value)
      .split(' ')
      .map((v) => v.trim())
      .filter((v) => v)
      .map((v) => {
        // eslint-disable-next-line security/detect-non-literal-regexp
        return new RegExp(v)
      })
  },
  validate(origins) {
    return origins.every(
      (origin) => origin.test('http://') || origin.test('https://')
    )
  },
})

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
 *  env: 'dev' | 'prod',
 *  export: {
 *    baseUrl: string,
 *    urlEndpoint: string
 *  },
 *  hypothesis: {
 *    auth: {
 *      callbackUrl: string,
 *      clientId: string
 *    }
 *  },
 *  mongo: {
 *    databaseUrl: string
 *  },
 * auth: {
 *   enabledServices: string[]
 * },
 *  oauthProvider: {
 *    name: string,
 *    issuer: string,
 *    callbackUrl: string,
 *    client: {
 *      id: string,
 *      secret: string
 *    },
 *    auth: {
 *      tokenUrl: string,
 *      userInfo: string,
 *      url: string
 *    }
 *  },
 *  port: number,
 *  securedCookie: boolean,
 *  security: {
 *    cors: {
 *      origin: RegExp[]
 *    },
 *    jwt: {
 *      secret: string
 *    },
 *    session: {
 *      secret: string
 *    }
 *  },
 *  sentry: {
 *    dsn: string | null
 *  },
 *  yjs: {
 *    persistenceDataDirectory: string
 *  },
 *  zotero: {
 *    auth: {
 *      callbackUrl: string,
 *      clientKey: string,
 *      clientSecret: string
 *    }
 *  }
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
  auth: {
    enabledServices: {
      format: 'Array',
      default: ['humanid', 'zotero', 'hypothesis'],
    },
  },
  oauthProvider: {
    issuer: {
      format: 'url',
      env: 'HUMANID_ISSUER',
      default: null,
    },
    callbackUrl: {
      format: 'url',
      env: 'HUMANID_CALLBACK_URL',
      default: 'http://localhost:3000/authorization-code/callback',
    },
    client: {
      id: {
        format: String,
        sensitive: true,
        env: 'HUMANID_CLIENT_ID',
        default: null,
      },
      secret: {
        format: String,
        sensitive: true,
        env: 'HUMANID_CLIENT_SECRET',
        default: null,
      },
    },
    auth: {
      tokenUrl: {
        format: 'url',
        env: 'HUMANID_TOKEN_URL',
        default: null,
      },
      userInfo: {
        format: 'url',
        env: 'HUMANID_USER_INFO_URL',
        default: null,
      },
      url: {
        format: 'url',
        env: 'HUMANID_AUTH_URL',
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
        format: 'cors-origins',
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
  hypothesis: {
    auth: {
      callbackUrl: {
        format: 'url',
        env: 'HYPOTHESIS_AUTH_CALLBACK_URL',
        default: 'http://localhost:3030/authorization-code/hypothesis/callback',
      },
      clientId: {
        format: String,
        sensitive: true,
        env: 'HYPOTHESIS_AUTH_CLIENT_KEY',
        default: null,
      },
    },
  },
  zotero: {
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
