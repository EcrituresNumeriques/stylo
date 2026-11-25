const OAuth2Strategy = require('passport-oauth2')
const { registrationUrl } = require('./redirect.js')

const User = require('../models/user.js')
const config = require('../config.js')
const { createAccess } = require('../helpers/accesses.js')

const strategy = new OAuth2Strategy(
  {
    authorizationURL: 'https://hypothes.is/oauth/authorize',
    tokenURL: 'https://hypothes.is/api/token',
    clientID: config.get('hypothesis.auth.clientId'),
    clientSecret: '',
    callbackURL: config.get('hypothesis.auth.callbackUrl'),
    passReqToCallback: true,
    profile: true,
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

async function verify(req, accessToken, _refreshToken, _, done) {
  const { id, displayName } = await getProfileFromToken(accessToken)

  let user = await User.findOne({
    'authProviders.hypothesis.id': id,
  })

  const providerInfos = {
    id,
    token: accessToken,
  }

  // update user with more up to date values
  if (user) {
    user.mergeAuthProvider('hypothesis', providerInfos)
    if (!req.session.fromAccount) {
      user.recordAccess(createAccess({ ip: req.ip, strategy: 'hypothesis' }))
    }
    user = await user.save()
    return done(null, await user.save())
  }

  // trick to return no user but to let the onSuccess function decide what to do at response time
  // returning done(null, false) would trigger a 401, which is not what we want
  req.session.pendingRegistration = {
    displayName,
    authProviders: {
      hypothesis: providerInfos,
    },
  }

  return this.redirect(
    req.session.fromAccount
      ? `${req.session.origin}/credentials/auth-callback/hypothesis`
      : registrationUrl(req.session.origin, 'hypothesis', displayName)
  )
}

module.exports = {
  getProfileFromToken,
  strategy,
  verify,
}
