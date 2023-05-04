const pkg = require('./package.json')
const express = require('express')
const bodyParser = require('body-parser')
const { createHandler } = require('graphql-http/lib/use/express')
const mongoose = require('mongoose')
const cors = require('cors')

const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const OidcStrategy = require('passport-openidconnect').Strategy
const LocalStrategy = require('passport-local').Strategy
const OAuthStrategy = require('passport-oauth').OAuthStrategy;
const { logger } = require('./logger')
const pino = require('pino-http')({
  logger
})

const schema = require('./schema')
const { checkCredentials } = require('./resolvers/authResolver')

const { createJWTToken, populateUserFromJWT } = require('./helpers/token')
const User = require('./models/user')
const { ApiError } = require('./helpers/errors')
const { createTagLoader, createUserLoader, createArticleLoader, createVersionLoader } = require('./loaders')

const app = express()

const mongoServer = process.env.MONGO_SERVER
const mongoServerPort = process.env.MONGO_SERVER_PORT
const mongoServerDB = process.env.MONGO_SERVER_DB

const listenPort = process.env.PORT || 3030
const origin = process.env.ALLOW_CORS_FRONTEND
const jwtSecret = process.env.JWT_SECRET_SESSION_COOKIE
const sessionSecret = process.env.SESSION_SECRET
const oicName = process.env.OPENID_CONNECT_NAME
const oicIssuer = process.env.OPENID_CONNECT_ISSUER
const oicAuthUrl = process.env.OPENID_CONNECT_AUTH_URL
const oicTokenUrl = process.env.OPENID_CONNECT_TOKEN_URL
const oicUserInfoUrl = process.env.OPENID_CONNECT_USER_INFO_URL
const oicCallbackUrl = process.env.OPENID_CONNECT_CALLBACK_URL
const oicClientId = process.env.OPENID_CONNECT_CLIENT_ID
const oicClientSecret = process.env.OPENID_CONNECT_CLIENT_SECRET
const oicScope = process.env.OPENID_CONNECT_SCOPE || 'profile email'

const zoteroAuthClientKey = process.env.ZOTERO_AUTH_CLIENT_KEY
const zoteroAuthClientSecret = process.env.ZOTERO_AUTH_CLIENT_SECRET
const zoteroAuthCallbackUrl = process.env.ZOTERO_AUTH_CALLBACK_URL
const zoteroRequestTokenEndpoint = process.env.ZOTERO_REQUEST_TOKEN_ENDPOINT || 'https://www.zotero.org/oauth/request'
const zoteroAccessTokenEndpoint = process.env.ZOTERO_ACCESS_TOKEN_ENDPOINT || 'https://www.zotero.org/oauth/access'
const zoteroAuthorizeEndpoint = process.env.ZOTERO_AUTHORIZE_ENDPOINT || 'https://www.zotero.org/oauth/authorize'
const zoteroAuthScope = ['library_access=1', 'all_groups=read']

//A Secure cookie is only sent to the server with an encrypted request over the HTTPS protocol.
// Note that insecure sites (http:) can't set cookies with the Secure directive.
const secureCookie = process.env.HTTPS === 'true'
// When we have multiple origins (for instance, using deploy previews on different domains) then cookies `sameSite` attribute is permissive (using 'none' value).
// When we have a single origin (most likely when running in a production environment) then we are using a secure/strict value for cookies `sameSite` attribute ('strict').
// When using 'strict' value, cookies will not be sent along with requests initiated by third-party websites.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
const allowedOrigins = (origin ?? '').split(' ').filter(v => v).map(o => new RegExp('^' + o))
// SameSite should be None on cross-site response.
// Please note that "SameSite=None" must also specify the Secure attribute (they require a secure context/HTTPS).
const sameSiteCookies = allowedOrigins.length > 1 && secureCookie ? 'none' : 'lax'

const corsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  // Access-Control-Allow-Origin header will be added only if the inbound Origin header matches one of the allowed origins
  origin: (origin, callback) => {
    const found = allowedOrigins.some(o => o.test(origin))
    callback(null, found ? origin : false)
  }
}

passport.use('zotero', new OAuthStrategy({
    requestTokenURL: zoteroRequestTokenEndpoint,
    accessTokenURL: zoteroAccessTokenEndpoint,
    userAuthorizationURL: zoteroAuthorizeEndpoint + '?all_groups=read&library_access=1',
    consumerKey: zoteroAuthClientKey,
    consumerSecret: zoteroAuthClientSecret,
    callbackURL: zoteroAuthCallbackUrl,
    sessionKey: 'oauth_token'
  },
  function (zoteroToken, tokenSecret, profile, done) {
    return done(null, { zoteroToken })
  }
))

passport.use('oidc', new OidcStrategy({
  name: oicName,
  issuer: oicIssuer,
  authorizationURL: oicAuthUrl,
  tokenURL: oicTokenUrl,
  userInfoURL: oicUserInfoUrl,
  clientID: oicClientId,
  clientSecret: oicClientSecret,
  callbackURL: oicCallbackUrl,
  skipUserProfile: false,
  scope: oicScope
}, async (iss, profile, done) => {
  // careful, function arity matters https://github.com/jaredhanson/passport-openidconnect/blob/6197df6adf878bb641fd605c55f1c92f67253a07/lib/strategy.js#L223-L252
  // profile has this shape https://www.passportjs.org/reference/normalized-profile/
  // when 'skipUserProfile' is set to false (aka: give us profile data)
  const { name, displayName } = profile
  const { value: email } = profile.emails[0] || {}

  if (!email) {
    throw new ApiError('Cannot find or create a user without email address.')
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
}))

passport.use(new LocalStrategy({ session: false },
  function (username, password, done) {
    checkCredentials({ username, password })
      .then(user => done(null, user))
      .catch(e => done(e, false))
  }
))

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
app.use(session({
  secret: sessionSecret,
  resave: false,
  proxy: true,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    httpOnly: true,
    secure: secureCookie,
    sameSite: sameSiteCookies
  }
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/version', (req, res) => res.json({
  name: pkg.name,
  version: pkg.version
}))

app.get('/login/openid', async (req, res, next) => {
    if (req.user) {
      const { email } = req.user
      const token = await createJWTToken({ email, jwtSecret })
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
    req.session.origin = req.headers.referer
    next()
  },
  passport.authenticate('zotero', { scope: zoteroAuthScope })
)

app.use('/authorization-code/zotero/callback',
  (req, res, next) => {
    passport.authenticate('zotero', async (err, user, info, status) => {
      if (err) {
        logger.error({ err }, 'Unable to authenticate on Zotero.')
        return next(err)
      }
      if (!user) {
        return res.status(401).redirect(req.session.origin)
      }
      const { zoteroToken } = user
      if (req.user) {
        const email = req.user.email

        // save the Zotero token
        const authenticatedUser = await User.findOne({ email })
        authenticatedUser.zoteroToken = zoteroToken
        await authenticatedUser.save()

        res.status(200)
          .set({
            'Content-Type': 'text/html'
          })
          .end(`<script>window.close();</script>`)
      } else {
        logger.error({ err, user, info, status }, 'Unable to authenticate on Zotero, no user session found.')
        res.status(400).redirect(req.session.origin)
      }

    })(req, res, next)
  })

app.use('/authorization-code/callback',
  passport.authenticate('oidc', { failWithError: true }),
  async function onSuccess (req, res) {
    const { email } = req.user
    const token = await createJWTToken({ email, jwtSecret })
    return res.redirect(`${req.session.origin ?? '/'}#auth-token=${token}`)
  },
  function onFailure (error, req, res) {
    logger.error({ error }, 'Unexpected error.')
    res.redirect(`/error?message=${error.message}`)
  })

app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err)
    }
    req.session.destroy()
    res.redirect(req.headers.referer)
  })
})

app.post('/login/local',
  passport.authenticate('local', { failWithError: true }),
  async function onSuccess (req, res) {
    const { email } = req.user

    const token = await createJWTToken({ email, jwtSecret })

    res.statusCode = 200
    res.json({ user: req.user, token })
  },
  function onFailure (error, req, res) {
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

app.post('/graphql', populateUserFromJWT({ jwtSecret }), createHandler({
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
      userId: user?.id.toString() || token._id,
      loaders: createLoaders()
    }
  },
}))

// fix deprecation warnings: https://mongoosejs.com/docs/deprecations.html
mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useCreateIndex', true)

mongoose
  .connect(`mongodb://${mongoServer}:${mongoServerPort}/${mongoServerDB}`)
  .then(() => {
    logger.info('Listening on http://localhost:%s', listenPort)
    app.listen(listenPort)
  })
  .catch(err => {
    logger.error({ err }, 'Unable to connect to MongoDB.')
  })
