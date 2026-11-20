const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')
const pkg = require('./package.json')
const process = require('node:process')
const debounce = require('lodash.debounce')
const config = require('./config.js')
const proxy = require('express-http-proxy')
const migrate = require('db-migrate')
const bodyParser = require('body-parser')

config.validate({ allowed: 'strict' })
// refuses to start with an invalid features file
require('./helpers/features.js').loadFeatures()

if (config.get('sentry.dsn')) {
  Sentry.init({
    dsn: config.get('sentry.dsn'),
    environment: config.get('env'),
    release: `stylo-graphql@${pkg.version}`,
    attachStacktrace: true,
    includeLocalVariables: true,
    integrations: [
      nodeProfilingIntegration(),
      Sentry.dedupeIntegration(),
      Sentry.mongooseIntegration(),
      Sentry.graphqlIntegration(),
      Sentry.dataloaderIntegration(),
      Sentry.consoleIntegration(),
      Sentry.extraErrorDataIntegration(),
      Sentry.onUncaughtExceptionIntegration(),
      Sentry.onUnhandledRejectionIntegration(),
      Sentry.linkedErrorsIntegration(),
      Sentry.rewriteFramesIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  })
}

process.env.YPERSISTENCE = config.get(
  'collaboration.editingSessionDataDirectory'
)

const express = require('express')
const { createHandler } = require('graphql-http/lib/use/express')
const mongoose = require('mongoose')
const cors = require('cors')

const session = require('express-session')
const { MongoStore } = require('connect-mongo')
const passport = require('passport')
const { logger } = require('./logger')
const pino = require('pino-http')({
  logger,
})

const schema = require('./schema')

const { removeAtomSummaries } = require('./helpers/feed.js')
const {
  canJoinArticleRoom,
  isArticleRoomUrl,
} = require('./helpers/collaboration.js')
const { populateUserFromJWT } = require('./helpers/token.js')
const { reportExecutionErrors } = require('./helpers/errorReporting.js')
const { requireFeature } = require('./helpers/features.js')
const { principalFromToken } = require('./auth/principal.js')
const { validationRules } = require('./policies/serviceAccess.js')

const User = require('./models/user')
const {
  stampAuth,
  onAuthSuccess,
  onAuthFailure,
  localAuth,
  humanidAuth,
  hypothesisAuth,
  zoteroAuth,
} = require('./auth/index.js')

const { createLoaders } = require('./loaders.js')

const yjsUtils = require('./helpers/yjs-utils.mjs')
// Reuse the single (ESM) Yjs instance exposed by yjs-utils instead of
// require('yjs') (CJS build) to avoid loading Yjs twice. See yjs#438.
const Y = yjsUtils.Y
const WebSocket = require('ws')
const { handleEvents } = require('./events')
const { requestHandler: backupRequestHandler } = require('./backup')
const {
  readHandler: attachmentReadHandler,
  uploadHandler: attachmentUploadHandler,
} = require('./attachments')
const wss = new WebSocket.Server({ noServer: true })

const jwtSecret = config.get('security.jwt.secret')

//A Secure cookie is only sent to the server with an encrypted request over the HTTPS protocol.
// Note that insecure sites (http:) can't set cookies with the Secure directive.
const secureCookie = config.get('securedCookie')
// When we have multiple origins (for instance, using deploy previews on different domains) then cookies `sameSite` attribute is permissive (using 'none' value).
// When we have a single origin (most likely when running in a production environment) then we are using a secure/strict value for cookies `sameSite` attribute ('strict').
// When using 'strict' value, cookies will not be sent along with requests initiated by third-party websites.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
const allowedOrigins = config.get('security.cors.origin')

// SameSite should be None on cross-site response.
// Please note that "SameSite=None" must also specify the Secure attribute (they require a secure context/HTTPS).
/**
 * @type {boolean | "lax" | "strict" | "none"}
 */
const sameSiteCookies =
  allowedOrigins.length > 1 && secureCookie ? 'none' : 'lax'

/**
 * @type {import('cors').CorsOptions}
 */
const corsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  // Access-Control-Allow-Origin header will be added only if the inbound Origin header matches one of the allowed origins
  origin(origin, callback) {
    const found = allowedOrigins.some((o) => o.test(origin))
    callback(null, found ? origin : false)
  },
}

/*
 * Setup database
 */
const mongooseP = mongoose
  .connect(config.get('mongo.databaseUrl'))
  .then((m) => m.connection.getClient())

/*
 * Setup App
 */
const app = express()

config.get('sentry.dsn') && Sentry.setupExpressErrorHandler(app)

/**
 * @type {import('express-session').SessionOptions}
 */
const sessionOptions = {
  name: 'stylo.session',
  secret: config.get('security.session.secret'),
  resave: false,
  proxy: true,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: mongooseP,
    autoRemove: 'native',
    touchAfter: 12 * 3600,
  }),
  cookie: {
    httpOnly: true,
    secure: secureCookie,
    sameSite: sameSiteCookies,
  },
}

passport.use('zotero', zoteroAuth.strategy)
passport.use('humanid', humanidAuth.strategy)
passport.use('hypothesis', hypothesisAuth.strategy)
passport.use(localAuth.strategy)

// mandatory for passport-login/logout
passport.serializeUser((user, next) => next(null, user.id))
passport.deserializeUser(async (id, next) => {
  const user = await User.findById(id)
  next(null, user)
})

app.set('trust proxy', true)
app.set('x-powered-by', false)
app.use(pino)
app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(session(sessionOptions))

app.use(passport.session(sessionOptions))

app.get('/version', (_req, res) =>
  res.json({
    name: pkg.name,
    version: pkg.version,
    // `null` quand la version n'est pas renseignée (développement local)
    exportVersion: config.get('export.version') || null,
    pandocApiVersion: config.get('pandocApi.version') || null,
  })
)

app.get('/events', handleEvents)

config.get('auth.enabledServices').forEach((service) => {
  // used on initial login
  app.get(
    `/login/${service}`,
    stampAuth(service),
    passport.authenticate(service)
  )

  // used to link account when we are already logged in
  app.get(
    `/authorize/${service}`,
    stampAuth(service, { alreadyLoggedIn: true }),
    passport.authorize(service)
  )
})

app.post(
  '/login/local',
  passport.authenticate('local'),
  localAuth.onSuccess,
  localAuth.onFailure
)

app.use(
  '/authorization-code/hypothesis/callback',
  passport.authorize('hypothesis', { failWithError: true }),
  onAuthSuccess,
  onAuthFailure
)

app.use(
  '/authorization-code/zotero/callback',
  passport.authorize('zotero', { failWithError: true }),
  onAuthSuccess,
  onAuthFailure
)

app.use(
  '/authorization-code/callback',
  passport.authorize('humanid', { failWithError: true }),
  onAuthSuccess,
  onAuthFailure
)

/*
 * Feed proxy
 */
app.use(
  '/community/alerts.json',
  proxy('https://discussions.revue30.org', {
    parseReqBody: false,
    proxyReqPathResolver() {
      // we filter on pinned alert, latest topic first
      return '/search.json?q=tags:alerte&amp;in:pinned&amp;order:latest_topic'
    },
  })
)
app.use(
  '/feed/publications',
  proxy('https://revue30.org', {
    parseReqBody: false,
    proxyReqPathResolver() {
      return '/blog/feed.xml'
    },
    proxyReqOptDecorator(proxyReqOpts) {
      // the response body is decorated: only accept encodings that express-http-proxy can decode
      proxyReqOpts.headers['accept-encoding'] = 'gzip'
      return proxyReqOpts
    },
    userResHeaderDecorator(headers) {
      return { ...headers, 'cache-control': 'public, max-age=3600' }
    },
    // only used by the home page, which does not display the full text of the posts
    userResDecorator(_proxyRes, proxyResData) {
      return removeAtomSummaries(proxyResData.toString('utf8'))
    },
  })
)
app.use(
  '/feed/releases',
  proxy('https://github.com', {
    parseReqBody: false,
    proxyReqPathResolver() {
      return '/ecrituresNumeriques/stylo/releases.atom'
    },
  })
)

/* Nakala */
app.use(
  '/nakala',
  populateUserFromJWT({ jwtSecret }),
  requireFeature('nakala'),
  proxy(config.get('nakala.apiUrl'), {
    // the Stylo token is not meant for Nakala
    proxyReqOptDecorator({
      headers: { authorization: _, ...headers },
      ...options
    }) {
      return { ...options, headers }
    },
  })
)

/* Backup */
app.post(
  '/backup',
  populateUserFromJWT({ jwtSecret }),
  bodyParser.json(),
  backupRequestHandler
)

/* Attachments, under /graphql to go through the existing reverse proxies */
app.post(
  '/graphql/attachments',
  populateUserFromJWT({ jwtSecret }),
  express.raw({ type: 'image/*', limit: '10mb' }),
  attachmentUploadHandler
)
app.get('/graphql/attachments/:attachmentId', attachmentReadHandler)

/*
 * GraphQL interface
 */

app.post(
  '/graphql',
  populateUserFromJWT({ jwtSecret }),
  createHandler({
    schema,
    validationRules,
    /**
     * @param {express.Request} req
     * @returns {import('./helpers/token.js').RequestContext}
     */
    context(req) {
      const token = req.raw.token ?? {}
      const user = req.raw.user ?? null
      return {
        loaders: createLoaders(),
        session: req.raw.session,
        principal: principalFromToken(token, user),
        ip: req.raw.ip,
        token,
        user,
        userId: user?.id.toString() || token?._id,
      }
    },
    /**
     * @param {express.Request} _req
     * @param {import('graphql').ExecutionArgs} args
     * @param {import('graphql').ExecutionResult} result
     */
    onOperation(_req, args, result) {
      reportExecutionErrors(args, result)
    },
  })
)

// Collaborative Writing Websocket
const builtinPersistence = yjsUtils.getPersistence()
yjsUtils.setPersistence({
  bindState: async (roomName, ydoc) => {
    if (roomName) {
      const articleId = roomName.split('/')[1] // format: ws/{articleId}
      const result = await mongoose.connection.collection('articles').findOne({
        $and: [
          { _id: new mongoose.Types.ObjectId(articleId) },
          { 'workingVersion.ydoc': { $ne: null } },
        ],
      })
      if (result) {
        try {
          const documentState = Buffer.from(
            result.workingVersion.ydoc,
            'base64'
          )
          Y.applyUpdate(ydoc, documentState)
        } catch (error) {
          // lib0 errors have a meaningless stack trace (see WorkingVersion.md resolver)
          Sentry.captureException(
            new Error('Unable to load document state from the working copy', {
              cause: error,
            }),
            { tags: { articleId } }
          )
          console.error(
            `Unable to load document state from the working copy on article: ${articleId}`,
            error
          )
        }
      }
      try {
        // noinspection ES6RedundantAwait — le type est déclaré void mais l'implémentation LevelDB (initialisée quand YPERSISTENCE est configuré) est bien async
        await builtinPersistence.bindState(roomName, ydoc)
      } catch (error) {
        Sentry.captureException(error)
        console.error(
          `Unable to bind persistence state for article: ${articleId}`,
          error
        )
      }
      ydoc.on(
        'update',
        debounce(
          async () => {
            const articleId = roomName.split('/')[1] // format: ws/{articleId}
            try {
              const documentState = Y.encodeStateAsUpdate(ydoc) // is a Uint8Array
              await mongoose.connection.collection('articles').updateOne(
                { _id: new mongoose.Types.ObjectId(articleId) },
                {
                  $set: {
                    'workingVersion.ydoc':
                      Buffer.from(documentState).toString('base64'),
                    updatedAt: new Date(),
                  },
                }
              )
            } catch (error) {
              Sentry.captureException(error)
              console.error(
                `Unable to save document state to the working copy on article: ${articleId}`,
                error
              )
            }
          },
          config.get('collaboration.updateWorkingCopyIntervalMs'),
          { leading: false, trailing: true }
        )
      )
    }
  },
  writeState: async (roomName, ydoc) => {
    if (roomName) {
      try {
        await builtinPersistence.writeState(roomName, ydoc)
      } catch (error) {
        Sentry.captureException(error)
        console.error(
          `Unable to write persistence state for room: ${roomName}`,
          error
        )
      }
    }
  },
})
wss.on('connection', yjsUtils.setupWSConnection)

async function runMigrations() {
  const migrateInstance = migrate.getInstance(true, { cwd: __dirname })
  await migrateInstance.up()
}

runMigrations()
  .then(() => {
    const server = app.listen(config.get('port'), (err) => {
      if (err) {
        logger.error({ err }, 'Unable to connect to MongoDB.')
        throw err
      }

      logger.info('Listening on http://localhost:%s', config.get('port'))
    })

    server.on('upgrade', (request, socket, head) => {
      // the room name contains the article id, used as a MongoDB ObjectId when loading the document
      if (!isArticleRoomUrl(request.url)) {
        socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n')
        return
      }
      canJoinArticleRoom(request.url, { jwtSecret })
        .then((allowed) => {
          if (!allowed) {
            socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n')
            return
          }
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request)
          })
        })
        .catch((error) => {
          Sentry.captureException(error)
          socket.end(
            'HTTP/1.1 500 Internal Server Error\r\nConnection: close\r\n\r\n'
          )
        })
    })
  })
  .catch((err) => {
    logger.error({ err }, 'Unable to run database migrations.')
    process.exit(1)
  })
