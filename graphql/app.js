const Sentry = require('@sentry/node')
const { nodeProfilingIntegration } = require('@sentry/profiling-node')
const pkg = require('./package.json')
const process = require('node:process')
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

process.env.YPERSISTENCE = config.get('yjs.persistenceDataDirectory')

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
const localAuth = require('./auth/local.js')
const zoteroAuth = require('./auth/zotero.js')
const hypothesisAuth = require('./auth/hypothesis.js')
const humanidAuth = require('./auth/humanid.js')

const {
  createTagLoader,
  createUserLoader,
  createArticleLoader,
  createVersionLoader,
} = require('./loaders')

const { setupWSConnection } = require('y-websocket/bin/utils')
const WebSocket = require('ws')
const { handleEvents } = require('./events')
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
app.post(
  '/login/local',
  passport.authenticate('local'),
  localAuth.onSuccess,
  localAuth.onFailure
)

app.use(
  '/authorization-code/hypothesis/callback',
  passport.authenticate('hypothesis'),
  hypothesisAuth.onSuccess,
  hypothesisAuth.onFailure
)

app.use(
  '/authorization-code/zotero/callback',
  passport.authenticate('zotero'),
  zoteroAuth.onSuccess,
  zoteroAuth.onFailure
)

app.use(
  '/authorization-code/callback',
  passport.authenticate('humanid'),
  humanidAuth.onSuccess,
  humanidAuth.onFailure
)

app.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    req.session.destroy()
    res.redirect(req.headers.referer)
  })
})

function createLoaders() {
  return {
    tags: createTagLoader(),
    users: createUserLoader(),
    articles: createArticleLoader(),
    versions: createVersionLoader(),
  }
}

app.post(
  '/graphql',
  populateUserFromJWT({ jwtSecret }),
  createHandler({
    schema,
    /**
     * @param {express.Request} req
     * @returns {{token: DecodedJWT, user: User}}
     */
    context: (req) => {
      const token = req.raw.token ?? {}
      const user = req.raw.user ?? null
      return {
        token,
        user,
        userId: user?.id.toString() || token?._id,
        loaders: createLoaders(),
      }
    },
  })
)

// Collaborative Writing Websocket
wss.on('connection', setupWSConnection)

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
