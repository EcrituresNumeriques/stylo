const OAuthStrategy = require('passport-oauth1').Strategy

const config = require('../config.js')
const User = require('../models/user.js')

const strategy = new OAuthStrategy(
  {
    requestTokenURL: 'https://www.zotero.org/oauth/request',
    accessTokenURL: 'https://www.zotero.org/oauth/access',
    userAuthorizationURL:
      'https://www.zotero.org/oauth/authorize?all_groups=read&library_access=1',
    consumerKey: config.get('zotero.auth.clientKey'),
    consumerSecret: config.get('zotero.auth.clientSecret'),
    callbackURL: config.get('zotero.auth.callbackUrl'),
    sessionKey: 'oauth_token',
  },
  verify
)

async function getProfileFromToken(token) {
  const response = await fetch(`https://api.zotero.org/keys/${token}`, {
    headers: {
      accept: 'application/json',
    },
  })

  const { userID: id, username, displayName, access } = await response.json()

  return {
    id,
    displayName,
    username,
    access,
  }
}

function onFailure(error, req, res) {
  res.statusCode = 401
  res.json({ error })
}

function onSuccess(req, res) {
  console.log(req.referer)
  res.redirect(req.origin + '/#zotero&auth-code=abcd')
}

async function verify(token, tokenSecret, profile, params, done) {
  const { id, username } = await getProfileFromToken(token)

  let user = await User.findOne({ 'authProviders.zotero.id': id })
  const providerInfos = {
    id,
    username,
    token,
    updatedAt: Date.now(),
  }

  // update user with more up to date values
  if (user) {
    user.set({
      connectedAt: Date.now(),
      'authProviders.zotero': providerInfos,
    })
    user = await user.save()
    return done(null, user)
  }

  user = new User({
    connectedAt: Date.now(),
    username,
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
