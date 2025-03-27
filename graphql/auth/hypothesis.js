const OAuth2Strategy = require('passport-oauth2')

const User = require('../models/user.js')
const config = require('../config.js')

const strategy = new OAuth2Strategy(
  {
    authorizationURL: 'https://hypothes.is/oauth/authorize',
    tokenURL: 'https://hypothes.is/api/token',
    clientID: config.get('hypothesis.auth.clientId'),
    clientSecret: '',
    callbackURL: config.get('hypothesis.auth.callbackUrl'),
  },
  verify
)

async function getProfileFromToken(accessToken) {
  const response = await fetch('https://hypothes.is/api/profile', {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await response.json()

  return {
    id: data.userid,
    displayName: data.user_info.display_name,
  }
}

function onFailure(error, req, res) {
  res.statusCode = 401
  res.json({ error })
}

function onSuccess(req, res) {
  res.redirect('/#hypothesis&auth-code=abcd')
}

async function verify(accessToken, refreshToken, _, done) {
  const { id, displayName } = await getProfileFromToken(accessToken)

  let user = await User.findOne({
    'authProviders.hypothesis.id': id,
  })
  const providerInfos = {
    id,
    accessToken,
    updatedAt: Date.now(),
  }

  // update user with more up to date values
  if (user) {
    user.set({
      connectedAt: Date.now(),
      'authProviders.hypothesis': providerInfos,
    })
    user = await user.save()
    return done(null, user)
  }
  user = new User({
    connectedAt: Date.now(),
    displayName,
    'authProviders.zotero': providerInfos,
  })

  // we populate a user with initial content
  await user.save()
  await user.createDefaultArticle()

  // this will be stored in session via `serializeUser()`
  return done(null, user)
}

module.exports = {
  getProfileFromToken,
  onFailure,
  onSuccess,
  strategy,
  verify,
}
