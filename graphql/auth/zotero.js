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
    profile: true,
    passReqToCallback: true,
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

async function verify(req, token, tokenSecret, profile, params, done) {
  const { id, username } = await getProfileFromToken(token)

  const user = await User.findOne({ 'authProviders.zotero.id': id })

  const providerInfos = {
    id,
    username,
    token,
  }

  if (user) {
    user.set({
      connectedAt: Date.now(),
      'authProviders.zotero': providerInfos,
    })

    return done(null, await user.save())
  }

  // trick to return no user but to let the onSuccess function decide what to do at response time
  // returning done(null, false) would trigger a 401, which is not what we want
  req.session.pendingRegistration = {
    authProviders: {
      zotero: providerInfos,
    },
  }

  return this.redirect(
    req.session.fromAccount
      ? `${req.session.origin}/credentials/auth-callback/zotero`
      : `${req.session.origin}/register/zotero?name=${username}`
  )
}

module.exports = {
  getProfileFromToken,
  strategy,
  verify,
}
