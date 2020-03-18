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

const graphQlSchema = require('./schema/index')
const graphQlResolvers = require('./resolvers/index')

const isAuth = require('./middleware/isAuth')
const displayUser = require('./middleware/displayUser')

const User = require('./models/user')
const {postCreate} = User

const app = express();

//Look for environnement variables
const mongoServer = process.env.MONGO_SERVER || 'localhost'
const mongoServerPort = process.env.MONGO_SERVER_PORT || 27017
const mongoServerDB = process.env.MONGO_SERVER_DB || 'graphql'
const listenPort = process.env.NODE_ENV === 'dev' ? 3030 : 80
const origin = process.env.ALLOW_CORS_FRONTEND || 'http://localhost:3000'
const jwtSecret = process.env.JWT_SECRET || 'VerySecureSecret!'

const corsOptions = {
  origin: origin,
  optionsSuccessStatus: 200,
  credentials: true,
}

  // via https://auth-test.huma-num.fr/.well-known/openid-configuration
  passport.use('oidc', new OidcStrategy({
  name: 'humanid',
  issuer: 'https://auth-test.huma-num.fr',
  authorizationURL: 'https://auth-test.huma-num.fr/oauth2/authorize',
  tokenURL: 'https://auth-test.huma-num.fr/oauth2/token',
  userInfoURL: 'https://auth-test.huma-num.fr/oauth2/userinfo',
  clientID: process.env.OPENID_CONNECT_CLIENT_ID,
  clientSecret: process.env.OPENID_CONNECT_CLIENT_SECRET,
  callbackURL: 'http://localhost:3030/authorization-code/callback',
  scope: 'profile email'
}, (issuer, sub, profile, accessToken, refreshToken, done) => {
  console.log('passwport oidc strategy', issuer, sub, profile, accessToken, refreshToken)
  return done(null, profile);
}))

passport.serializeUser((user, next) => {
  next(null, user)
})

passport.deserializeUser((obj, next) => {
  next(null, obj)
})

app.use(cors(corsOptions))
app.use(bodyParser.json({limit:'50mb'}))
app.use(cookieParser())
app.use(session({
  secret: 'MyVoiceIsMyPassportVerifyMe',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())


app.use('/login', passport.authenticate('oidc'))

app.get('/profile', async (req, res) => {
  if (req.user) {
    let user = await User.findOne({ email: req.user._json.email })
    res.status(200)
    res.json({ user })
  } else {
    res.status(404)
    res.json({})
  }
})

app.use('/authorization-code/callback',
  passport.authenticate('oidc', { failureRedirect: '/error' }), async (req, res) => {
    const {email, given_name, family_name, name:displayName} = req.user._json
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

      // we populate a user with initial content
      await user.save().then(postCreate)
    }
    
    // generate a JWT token
    const payload = {
      usersIds: [user._id.toString()],
      passwordId: null,
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
      secure: process.env.HTTPS === "true"
    })

    res.redirect(origin)
  })

app.get('/logout', (req, res) => {
  req.logout()
  res.clearCookie('graphQL-jwt')
  res.redirect('/')
})

app.use(
  '/graphql',
  graphqlHttp((req,res) => ({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
    context: {req,res}
  }))
)

mongoose
  .connect(`mongodb://${mongoServer}:${mongoServerPort}/${mongoServerDB}`, {useNewUrlParser: true})
  .then(() => {
    console.log('Listening on port', listenPort)
    app.listen(listenPort)
  })
  .catch(err => {
    console.log(err)
  })
