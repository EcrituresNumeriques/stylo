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
const OidcStrategy = require('passport-openidconnect').Strategy
const LocalStrategy = require('passport-local').Strategy
const OAuthStrategy = require('passport-oauth1')
const { logger } = require('./logger')
const pino = require('pino-http')({
  logger,
})

const schema = require('./schema')
const { checkCredentials } = require('./resolvers/authResolver')

const { createJWTToken, populateUserFromJWT } = require('./helpers/token')
const User = require('./models/user')
const { ApiError } = require('./helpers/errors')
const {
  createTagLoader,
  createUserLoader,
  createArticleLoader,
  createVersionLoader,
} = require('./loaders')

const Y = require('yjs')
const yjsUtils = require('y-websocket/bin/utils')
const WebSocket = require('ws')
const { handleEvents } = require('./events')
const { mongo } = require('mongoose')
const wss = new WebSocket.Server({ noServer: true })

const listenPort = config.get('port')
const origin = config.get('security.cors.origin')
const jwtSecret = config.get('security.jwt.secret')
const sessionSecret = config.get('security.session.secret')
const oicName = config.get('oauthProvider.name')
const oicIssuer = config.get('oauthProvider.issuer')
const oicAuthUrl = config.get('oauthProvider.auth.url')
const oicTokenUrl = config.get('oauthProvider.auth.tokenUrl')
const oicUserInfoUrl = config.get('oauthProvider.auth.userInfo')
const oicCallbackUrl = config.get('oauthProvider.callbackUrl')
const oicClientId = config.get('oauthProvider.client.id')
const oicClientSecret = config.get('oauthProvider.client.secret')
const oicScope = config.get('oauthProvider.scope')

const zoteroAuthClientKey = config.get('zotero.auth.clientKey')
const zoteroAuthClientSecret = config.get('zotero.auth.clientSecret')
const zoteroAuthCallbackUrl = config.get('zotero.auth.callbackUrl')
const zoteroRequestTokenEndpoint = config.get('zotero.requestToken')
const zoteroAccessTokenEndpoint = config.get('zotero.accessPoint')
const zoteroAuthorizeEndpoint = config.get('zotero.authorize')
const zoteroAuthScope = ['library_access=1', 'all_groups=read']

//A Secure cookie is only sent to the server with an encrypted request over the HTTPS protocol.
// Note that insecure sites (http:) can't set cookies with the Secure directive.
const secureCookie = config.get('securedCookie')
// When we have multiple origins (for instance, using deploy previews on different domains) then cookies `sameSite` attribute is permissive (using 'none' value).
// When we have a single origin (most likely when running in a production environment) then we are using a secure/strict value for cookies `sameSite` attribute ('strict').
// When using 'strict' value, cookies will not be sent along with requests initiated by third-party websites.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
const allowedOrigins = (origin ?? '')
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

passport.use(
  'zotero',
  new OAuthStrategy(
    {
      requestTokenURL: zoteroRequestTokenEndpoint,
      accessTokenURL: zoteroAccessTokenEndpoint,
      userAuthorizationURL:
        zoteroAuthorizeEndpoint + '?all_groups=read&library_access=1',
      consumerKey: zoteroAuthClientKey,
      consumerSecret: zoteroAuthClientSecret,
      callbackURL: zoteroAuthCallbackUrl,
      sessionKey: 'oauth_token',
    },
    function (token, tokenSecret, profile, params, done) {
      return done(null, { token, profile })
    }
  )
)

passport.use(
  'oidc',
  new OidcStrategy(
    {
      name: oicName,
      issuer: oicIssuer,
      authorizationURL: oicAuthUrl,
      tokenURL: oicTokenUrl,
      userInfoURL: oicUserInfoUrl,
      clientID: oicClientId,
      clientSecret: oicClientSecret,
      callbackURL: oicCallbackUrl,
      skipUserProfile: false,
      scope: oicScope,
    },
    async (iss, profile, done) => {
      // careful, function arity matters https://github.com/jaredhanson/passport-openidconnect/blob/6197df6adf878bb641fd605c55f1c92f67253a07/lib/strategy.js#L223-L252
      // profile has this shape https://www.passportjs.org/reference/normalized-profile/
      // when 'skipUserProfile' is set to false (aka: give us profile data)
      const { name, displayName } = profile
      const { value: email } = profile.emails[0] || {}

      if (!email) {
        throw new ApiError(
          'Cannot find or create a user without email address.'
        )
      }

      let user = await User.findOne({ email })

      // we create a new user if we could find one
      if (!user) {
        user = new User({
          email,
          displayName,
          institution: '',
          firstName: name.givenName || '',
          lastName: name.familyName || '',
          authType: 'oidc',
        })

        try {
          // we populate a user with initial content
          await user.save()
          await user.createDefaultArticle()
        } catch (err) {
          return done(`Unable to create a new user ${email}, cause:`, err)
        }
      }

      // this, will be stored in session via `serializeUser()`
      return done(null, user)
    }
  )
)

passport.use(
  new LocalStrategy({ session: false }, function (username, password, done) {
    checkCredentials({ username, password })
      .then((user) => done(null, user))
      .catch((e) => done(e, false))
  })
)

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
app.use(
  session({
    secret: sessionSecret,
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
  })
)
app.use(passport.initialize())
app.use(passport.session())

app.get('/version', (req, res) =>
  res.json({
    name: pkg.name,
    version: pkg.version,
  })
)

app.get('/events', handleEvents)

app.get(
  '/login/openid',
  async (req, res, next) => {
    if (req.user) {
      const user = await User.assessLogin({ email: req.user.email })
      const token = await createJWTToken({ user, jwtSecret })
      res.redirect(`${req.headers.referer ?? '/'}#auth-token=${token}`)
    } else {
      req.session.origin = req.headers.referer
      req.session.save(next)
    }
  },
  passport.authenticate('oidc')
)

app.get(
  '/login/zotero',
  (req, res, next) => {
    req.session.returnTo = req.query.returnTo
    next()
  },
  passport.authenticate('zotero', { scope: zoteroAuthScope })
)

app.use('/authorization-code/zotero/callback', (req, res, next) => {
  passport.authenticate(
    'zotero',
    /**
     * @param {Error} err
     * @param {{token: String, profile: {userID: String, username: String}}} param1
     * @returns {import('express').Response}
     */
    async (err, { token, profile }) => {
      if (err) {
        logger.error({ err }, 'Unable to authenticate on Zotero.')

        return res
          .status(400)
          .redirect(`${req.session.returnTo}#type=error&message=${err.message}`)
      }

      res
        .status(200)
        .redirect(
          `${req.session.returnTo}#token=${token}&username=${profile.username}`
        )
    }
  )(req, res, next)
})

app.use(
  '/authorization-code/callback',
  passport.authenticate('oidc', { failWithError: true }),
  async function onSuccess(req, res) {
    const user = await User.assessLogin({ email: req.user.email })
    const token = await createJWTToken({ user, jwtSecret })
    return res.redirect(`${req.session.origin ?? '/'}#auth-token=${token}`)
  },
  function onFailure(error, req, res) {
    logger.error({ error }, 'Unexpected error.')
    res.redirect(`/error?message=${error.message}`)
  }
)

app.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    req.session.destroy()
    res.redirect('/')
  })
})

app.post(
  '/login/local',
  passport.authenticate('local', { failWithError: true }),
  async function onSuccess(req, res) {
    const user = await User.assessLogin({ email: req.user.email })
    const token = await createJWTToken({ user, jwtSecret })

    res.statusCode = 200
    res.json({ user: req.user, token })
  },
  function onFailure(error, req, res) {
    logger.error({ error }, 'Unexpected error.')
    res.statusCode = 401
    res.json({ error })
  }
)

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

const server = app.listen(listenPort, (err) => {
  if (err) {
    logger.error({ err }, 'Unable to connect to MongoDB.')
    throw err
  }

  logger.info('Listening on http://localhost:%s', listenPort)
})

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, function handleAuth(ws) {
    // const jwtToken = new URL('http://localhost' + request.url).searchParams.get("token")
    // TODO: check token and permissions
    wss.emit('connection', ws, request)
  })
})
