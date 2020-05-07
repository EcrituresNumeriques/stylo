const jwt = require('jsonwebtoken')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')
const cors = require('cors')

const session = require('express-session')
const passport = require('passport')
const OidcStrategy = require('passport-openidconnect').Strategy
const LocalStrategy = require('passport-local').Strategy

const graphQlSchema = require('./schema/index')
const graphQlResolvers = require('./resolvers/index')

const User = require('./models/user')
const Password = require('./models/user_password')
const { postCreate } = User

const app = express()

const mongoServer = process.env.MONGO_SERVER
const mongoServerPort = process.env.MONGO_SERVER_PORT
const mongoServerDB = process.env.MONGO_SERVER_DB

const listenPort = process.env.NODE_ENV === 'dev' ? 3030 : 80
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
const secure = process.env.HTTPS === 'true'

const corsOptions = {
  origin: origin,
  optionsSuccessStatus: 200,
  credentials: true,
}

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
    graphQlResolvers.verifCreds({username, password})
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

app.use(cors(corsOptions))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cookieParser())
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(function (req, res, next) {
  const jwtToken = req.cookies && req.cookies['graphQL-jwt']

  if (jwtToken) {
    try {
      const user = jwt.verify(jwtToken, jwtSecret)

      req.user = user
      req.isAuth = true
    }
    catch (error) {
      return next(error)
    }
  }

  return next()
})

app.get(
  '/login',
  (req, res, next) => req.user ? res.redirect('/') : next(),
  passport.authenticate('oidc')
)

app.get('/profile', async (req, res) => {
  if (req.user) {
    let user = await User.findOne({ email: req.user.email })
    res.status(200)
    res.json({ user })
  } else {
    res.status(404)
    res.json({})
  }
})

app.use('/authorization-code/callback',
  passport.authenticate('oidc', { failureRedirect: '/error' }), async (req, res) => {
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

    const userPassword = await Password.findOne({ email }).populate("users")

    // generate a JWT token
    const payload = {
      email,
      usersIds: userPassword.users.map(user => user._id.toString()),
      passwordId: userPassword.id,
      admin: Boolean(user.admin),
      session: true
    }
    const token = jwt.sign(
      payload,
      jwtSecret
    )

    res.cookie("graphQL-jwt", token, {
      expires: 0,
      httpOnly: true,
      secure: secure
    })

    res.redirect(origin)
  })

app.get('/logout', (req, res) => {
  req.logout()
  res.clearCookie('graphQL-jwt')
  res.redirect('/')
})

app.post('/login', 
  passport.authenticate('local', { failWithError: true }),
  function onSuccess(req, res, next) {
    const user = req.user
    const payload = {
      email: user.email,
      usersIds: user.users.map(user => user._id.toString()),
      passwordId: user._id,
      admin: Boolean(user.admin),
      session: true
    }

    const token = jwt.sign(
      payload,
      jwtSecret
    )

    res.cookie("graphQL-jwt", token, {
      expires: 0,
      httpOnly: true,
      secure: secure
    })
    
    res.statusCode = 200
    res.json({password: user.password, users: user.users, token})
  },
  function onFailure (error, req, res, next) {
    res.statusCode = 401
    res.json({})
  })

app.use(
  '/graphql',
  graphqlHttp((req, res) => ({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: process.env.NODE_ENV === 'dev',
    context: { req, res }
  }))
)

mongoose
  .connect(`mongodb://${mongoServer}:${mongoServerPort}/${mongoServerDB}`, { useNewUrlParser: true })
  .then(() => {
    console.log('Listening on port', listenPort)
    app.listen(listenPort)
  })
  .catch(err => {
    console.log(err)
  })
