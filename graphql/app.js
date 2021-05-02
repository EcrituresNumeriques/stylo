const pkg = require('./package.json')
const jwt = require('jsonwebtoken')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { graphqlHTTP } = require('express-graphql')
const mongoose = require('mongoose')
const cors = require('cors')

const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const OidcStrategy = require('passport-openidconnect').Strategy
const LocalStrategy = require('passport-local').Strategy
const OAuthStrategy = require('passport-oauth').OAuthStrategy;

const graphQlSchema = require('./schema/index')
const graphQlResolvers = require('./resolvers/index')

const { createJWTToken } = require('./helpers/token')
const User = require('./models/user')
const Password = require('./models/user_password')
const { postCreate } = User

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
const sameSiteCookies = zoteroAuthorizeEndpoint || oicAuthUrl ? 'lax' : 'strict'
if (sameSiteCookies === 'none') {
  console.warn('Cookies are configured with `sameSite: none`.')
}

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
  scope: oicScope
}, (issuer, sub, profile, accessToken, refreshToken, done) => {
  return done(null, profile)
}))

passport.use(new LocalStrategy({ session: false },
  function (username, password, done) {
    graphQlResolvers.verifCreds({ username, password })
      .then(userPassword => done(null, userPassword))
      .catch(e => done(e, false))
  }
))

// mandatory
passport.serializeUser((user, next) => {
  next(null, user)
})

passport.deserializeUser((obj, next) => {
  next(null, obj)
})

app.set('trust proxy', true)
app.use(cors(corsOptions))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cookieParser())
app.use(session({
  secret: sessionSecret,
  resave: false,
  proxy: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {
    httpOnly: true,
    secure: secureCookie,
    sameSite: sameSiteCookies
  }
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(function (req, res, next) {
  const jwtToken = req.cookies && req.cookies['graphQL-jwt']
  if (jwtToken) {
    try {
      req.user = jwt.verify(jwtToken, jwtSecret)
      req.isAuth = true
    } catch (error) {
      return next(error)
    }
  }

  return next()
})

app.get('/version', (req, res) => res.json({
  name: pkg.name,
  version: pkg.version,
  origin: res.get(req.headers.referer)
}))

app.get('/login', (req, res, _) => {
  res.redirect(req.headers.referer)
})

app.get(
  '/login/openid',
  (req, res, next) => {
    if (req.user) {
      res.redirect(req.headers.referer)
    } else {
      console.log(`GET /login/openid - req.headers.referer: ${req.headers.referer}`)
      req.session.origin = req.headers.referer
      next()
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

app.get('/profile', async (req, res) => {
  if (req.user) {
    const user = await User.findOne({ email: req.user.email }).populate("passwords")
    res.status(200)
    res.json({ user })
  } else {
    res.status(404)
    res.json({})
  }
})

app.use('/authorization-code/zotero/callback',
  passport.authenticate('zotero', { failureRedirect: '/error' }), async (req, res) => {
    // passport overrides "req.user" (session) with the Zotero token
    const { zoteroToken } = req.user
    const jwtToken = req.cookies && req.cookies['graphQL-jwt']
    if (jwtToken) {
      try {
        // reverts "req.user" with the user connected
        req.user = jwt.verify(jwtToken, jwtSecret)
        req.isAuth = true
        const email = req.user.email

        // save the Zotero token
        const authenticatedUser = await User.findOne({ email })
        authenticatedUser.zoteroToken = zoteroToken
        await authenticatedUser.save()

        res.statusCode = 200
        res.set({
          'Content-Type': 'text/html'
        })
        res.end(`<script>window.close();</script>`)
      } catch (error) {
        console.error('error', error)
        res.statusCode = 401
        res.redirect(req.session.origin)
      }
    } else {
      res.statusCode = 401
      res.redirect(req.session.origin)
    }
  })

app.use('/authorization-code/callback',
  (req, res, next) => {
    return passport.authenticate('oidc', {
      failureRedirect: '/error',
      failureFlash: true
    }, (err, user, info) => {
      console.log('/authorization-code/callback - callback', err, user, info)
      if (!user) {
        console.error('Unable to authenticate', info.message)
        res.redirect(`/error?message=${info.message}`)
      } else if (err) {
        console.error('error', err)
        res.redirect(`/error?message=${info.message}`)
      } else {
        req.user = user
        next()
      }
    })(req, res, next)
  },
  async (req, res) => {
    console.log(`/authorization-code/callback - req.session.origin: ${req.session.origin}`)
    const { email, given_name, family_name, name: displayName } = req.user._json
    let user = await User.findOne({ email })

    // we create a new user if we could find one
    if (!user) {
      user = new User({
        email,
        displayName,
        institution: '',
        firstName: given_name || name || '',
        lastName: family_name || ''
      })

      // add a "password" to allow the user to connect as himself!
      // a user can have multiple "passwords" (ie. accounts) linked to it.
      // this mecanism is used to share content between accounts.
      const password = new Password({ email, username: displayName })
      user.passwords.push(password)
      password.users.push(user)
      await password.save()

      // we populate a user with initial content
      await user.save().then(postCreate)
    }

    // generate a JWT token
    const token = await createJWTToken({ email, jwtSecret })

    res.cookie("graphQL-jwt", token, {
      expires: 0,
      httpOnly: true,
      secure: secureCookie,
      sameSite: sameSiteCookies
    })

    res.redirect(req.session.origin)
  }
)

app.get('/logout', (req, res) => {
  req.logout()
  res.clearCookie('graphQL-jwt')
  res.redirect(req.headers.referer)
})

app.post('/login',
  passport.authenticate('local', { failWithError: true }),
  function onSuccess(req, res, _) {
    const userPassword = req.user
    const payload = {
      email: userPassword.email,
      usersIds: userPassword.users.map(user => user._id.toString()),
      passwordId: userPassword._id,
      admin: Boolean(userPassword.admin),
      session: true
    }

    const token = jwt.sign(
      payload,
      jwtSecret
    )

    res.cookie("graphQL-jwt", token, {
      expires: 0,
      httpOnly: true,
      secure: secureCookie,
      sameSite: sameSiteCookies
    })

    res.statusCode = 200
    res.json({ password: userPassword, users: userPassword.users, token })
  },
  function onFailure(error, req, res, _) {
    console.error('error', error)
    res.statusCode = 401
    res.json({ error })
  })

app.use(
  '/graphql',
  graphqlHTTP((req, res) => ({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: process.env.NODE_ENV === 'dev',
    context: { req, res }
  }))
)

// fix deprecation warnings: https://mongoosejs.com/docs/deprecations.html
mongoose.set('useNewUrlParser', true)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useCreateIndex', true)

mongoose
  .connect(`mongodb://${mongoServer}:${mongoServerPort}/${mongoServerDB}`)
  .then(() => {
    console.log('Listening on http://localhost:%s', listenPort)
    app.listen(listenPort)
  })
  .catch(err => {
    console.log('Unable to connect to MongoDB', err)
  })
