const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')
const pkg = require('./package.json')
const process = require('node:process')
const debounce = require('lodash.debounce')
const config = require('./config.js')
config.validate({ allowed: 'strict' })

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
const bodyParser = require('body-parser')
const { createHandler } = require('graphql-http/lib/use/express')
const mongoose = require('mongoose')
const cors = require('cors')

const session = require('express-session')
const MongoStore = require('connect-mongo')
const passport = require('passport')
const { logger } = require('./logger')
const pino = require('pino-http')({
  logger,
})

const schema = require('./schema')

const { populateUserFromJWT } = require('./helpers/token.js')

const User = require('./models/user')
const {
  markAsFromAccount,
  onAuthSuccess,
  onAuthFailure,
  localAuth,
  humanidAuth,
  hypothesisAuth,
  zoteroAuth,
} = require('./auth/index.js')

const { createLoaders } = require('./loaders.js')

const Y = require('yjs')
const yjsUtils = require('y-websocket/bin/utils')
const WebSocket = require('ws')
const { handleEvents } = require('./events')
const { mongo } = require('mongoose')
const wss = new WebSocket.Server({ noServer: true })

const jwtSecret = config.get('security.jwt.secret')

//A Secure cookie is only sent to the server with an encrypted request over the HTTPS protocol.
// Note that insecure sites (http:) can't set cookies with the Secure directive.
const secureCookie = config.get('securedCookie')
// When we have multiple origins (for instance, using deploy previews on different domains) then cookies `sameSite` attribute is permissive (using 'none' value).
// When we have a single origin (most likely when running in a production environment) then we are using a secure/strict value for cookies `sameSite` attribute ('strict').
// When using 'strict' value, cookies will not be sent along with requests initiated by third-party websites.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
const allowedOrigins = (config.get('security.cors.origin') ?? '')
  .split(' ')
  .filter((v) => v)
  .map((o) => new RegExp('^' + o))
// SameSite should be None on cross-site response.
// Please note that "SameSite=None" must also specify the Secure attribute (they require a secure context/HTTPS).
const sameSiteCookies =
  allowedOrigins.length > 1 && secureCookie ? 'none' : 'lax'

const corsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  // Access-Control-Allow-Origin header will be added only if the inbound Origin header matches one of the allowed origins
  origin: (origin, callback) => {
    const found = allowedOrigins.some((o) => o.test(origin))
    callback(null, found ? origin : false)
  },
}

/*
 * Setup database
 */
const mongooseP = mongoose
  .connect(config.get('mongo.databaseUrl'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then((m) => m.connection.getClient())

/*
 * Setup App
 */
const app = express()

config.get('sentry.dsn') && Sentry.setupExpressErrorHandler(app)

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
  const user = await User.findById(id).populate({ path: 'permissions' })
  next(null, user)
})

app.set('trust proxy', true)
app.set('x-powered-by', false)
app.use(pino)
app.use(cors(corsOptions))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(session(sessionOptions))

app.use(passport.session(sessionOptions))

app.get('/version', (req, res) =>
  res.json({
    name: pkg.name,
    version: pkg.version,
  })
)

app.get('/events', handleEvents)

app.get('/login/humanid', passport.authenticate('humanid'))
app.get('/login/hypothesis', passport.authenticate('hypothesis'))
app.get('/login/zotero', passport.authenticate('zotero'))

app.get(
  '/authorize/humanid',
  markAsFromAccount('humanid'),
  passport.authorize('humanid')
)
app.get(
  '/authorize/hypothesis',
  markAsFromAccount('hypothesis'),
  passport.authorize('hypothesis')
)
app.get(
  '/authorize/zotero',
  markAsFromAccount('zotero'),
  passport.authorize('zotero')
)

app.post(
  '/login/local',
  passport.authenticate('local'),
  localAuth.onSuccess,
  localAuth.onFailure
)

app.use(
  '/authorization-code/hypothesis/callback',
  passport.authorize('hypothesis'),
  onAuthSuccess,
  onAuthFailure
)

app.use(
  '/authorization-code/zotero/callback',
  passport.authorize('zotero'),
  onAuthSuccess,
  onAuthFailure
)

app.use(
  '/authorization-code/callback',
  passport.authorize('humanid'),
  onAuthSuccess,
  onAuthFailure
)

/**
 * @returns {import('./').Loaders}
 */

app.post(
  '/graphql',
  populateUserFromJWT({ jwtSecret }),
  createHandler({
    schema,
    /**
     * @param {express.Request} req
     * @returns {import('./token.js').RequestContext}
     */
    context(req) {
      const token = req.raw.token ?? {}
      const user = req.raw.user ?? null
      return {
        loaders: createLoaders(),
        session: req.raw.session,
        token,
        user,
        userId: user?.id.toString() || token?._id,
      }
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
          { _id: new mongo.ObjectID(articleId) },
          { 'workingVersion.ydoc': { $ne: null } },
        ],
      })
      if (result) {
        try {
          const documentState = Buffer.from(result.workingVersion.ydoc, 'base64')
          Y.applyUpdate(ydoc, documentState)
        } catch (error) {
          Sentry.captureException(error)
          console.error(
            `Unable to load document state from the working copy on article: ${articleId}`,
            error
          )
        }
      }
      await builtinPersistence.bindState(roomName, ydoc)
      ydoc.on(
        'update',
        debounce(
          async () => {
            const articleId = roomName.split('/')[1] // format: ws/{articleId}
            try {
              const documentState = Y.encodeStateAsUpdate(ydoc) // is a Uint8Array
              await mongoose.connection.collection('articles').updateOne(
                { _id: new mongo.ObjectID(articleId) },
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
      await builtinPersistence.writeState(roomName, ydoc)
    }
  },
})
wss.on('connection', yjsUtils.setupWSConnection)

const server = app.listen(config.get('port'), (err) => {
  if (err) {
    logger.error({ err }, 'Unable to connect to MongoDB.')
    throw err
  }

  logger.info('Listening on http://localhost:%s', config.get('port'))
})

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, function handleAuth(ws) {
    // const jwtToken = new URL('http://localhost' + request.url).searchParams.get("token")
    // TODO: check token and permissions
    wss.emit('connection', ws, request)
  })
})
