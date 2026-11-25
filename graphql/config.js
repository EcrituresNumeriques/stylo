const convict = require('convict')
const assert = require('node:assert/strict')
require('dotenv').config({ path: ['.env', '../.env'] })

const isURL = require('validator/lib/isURL')
const ospath = require('node:path')

convict.addFormat(require('convict-format-with-validator').url)

/**
 * Variables d'environnement renommées : nouveau nom → ancien nom (préfixe
 * SNOWPACK_, hérité de Snowpack). L'ancien nom reste lu en repli pour ne pas
 * casser les instances existantes.
 */
const legacyEnvNames = {
  ANNOTATIONS_CANONICAL_BASE_URL:
    'SNOWPACK_PUBLIC_ANNOTATIONS_CANONICAL_BASE_URL',
  PANDOC_EXPORT_ENDPOINT: 'SNOWPACK_PUBLIC_PANDOC_EXPORT_ENDPOINT',
}
for (const [name, legacyName] of Object.entries(legacyEnvNames)) {
  if (
    process.env[name] === undefined &&
    process.env[legacyName] !== undefined
  ) {
    console.warn(
      `[stylo] La variable d'environnement ${legacyName} est obsolète, utilisez ${name} à la place.`
    )
    process.env[name] = process.env[legacyName]
  }
}

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
  name: 'positive-int',
  coerce: (v) => Number(v),
  validate: (val) =>
    assert.ok(
      Number.isInteger(val) && val > 0,
      'must be a positive integer (greater than 0)'
    ),
})
/**
 * Value of the Express `trust proxy` setting, either a number of hops,
 * a comma-separated list of trusted addresses, subnets or names (loopback, linklocal, uniquelocal),
 * or false when no proxy is trusted.
 * See https://expressjs.com/en/guide/behind-proxies.html
 */
convict.addFormat({
  name: 'trust-proxy',
  coerce(v) {
    const value = String(v).trim()
    if (/^\d+$/.test(value)) {
      return Number(value)
    }
    if (value === 'false') {
      return false
    }
    return value
  },
  validate(val) {
    // `true` would trust every X-Forwarded-For value, including the ones forged by a client
    assert.ok(
      val !== 'true' && val !== true,
      'must not be true (every client could forge its IP address), use a number of hops or a list of trusted addresses'
    )
    assert.ok(
      val === false ||
        (Number.isInteger(val) && val >= 0) ||
        (typeof val === 'string' && val !== ''),
      'must be a number of hops, a list of trusted addresses or false'
    )
    // Express checks the addresses and the names, an invalid value would make the server fail at startup
    require('express')().set('trust proxy', val)
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
 *    },
 *    trustProxy: number | string,
 *    loginRateLimit: {
 *      enabled: boolean,
 *      windowMinutes: number,
 *      maxFailuresPerIp: number,
 *      maxFailuresPerIdentifierAndIp: number,
 *      maxFailuresPerIdentifier: number
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
      env: 'ANNOTATIONS_CANONICAL_BASE_URL',
      default: 'https://stylo.ecrituresnumeriques.ca',
    },
    urlEndpoint: {
      format: 'url',
      env: 'PANDOC_EXPORT_ENDPOINT',
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
    trustProxy: {
      doc: 'Reverse proxies whose X-Forwarded-* headers are trusted, as a number of hops or a list of trusted addresses, subnets or names. The default trusts the loopback and private addresses (nginx on the same server, Docker network) and never the X-Forwarded-For sent by a client.',
      format: 'trust-proxy',
      env: 'TRUST_PROXY',
      default: 'loopback, uniquelocal',
    },
    loginRateLimit: {
      enabled: {
        doc: 'Limits the failed login attempts.',
        format: Boolean,
        env: 'LOGIN_RATE_LIMIT_ENABLED',
        default: true,
      },
      windowMinutes: {
        doc: 'Duration, in minutes, of the window over which the failed attempts are counted (login and current password check).',
        format: 'positive-int',
        env: 'LOGIN_RATE_LIMIT_WINDOW_MINUTES',
        default: 15,
      },
      maxFailuresPerIp: {
        doc: 'Failed login attempts allowed per IP address during the window.',
        format: 'positive-int',
        env: 'LOGIN_MAX_FAILURES_PER_IP',
        default: 50,
      },
      maxFailuresPerIdentifierAndIp: {
        doc: 'Failed login attempts allowed per account identifier and IP address during the window. Also used for the failed checks of the current password when changing it.',
        format: 'positive-int',
        env: 'LOGIN_MAX_FAILURES_PER_IDENTIFIER_AND_IP',
        default: 10,
      },
      maxFailuresPerIdentifier: {
        doc: 'Failed login attempts allowed per account identifier, all IP addresses together, during the window.',
        format: 'positive-int',
        env: 'LOGIN_MAX_FAILURES_PER_IDENTIFIER',
        default: 100,
      },
    },
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
  nakala: {
    apiUrl: {
      format: 'url',
      env: 'NAKALA_API_URL',
      default: 'https://apitest.nakala.fr',
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
