const User = require('../models/user.js')
const config = require('../config.js')
const OidcStrategy = require('passport-openidconnect').Strategy

const strategy = new OidcStrategy(
  {
    name: 'HumanID',
    issuer: config.get('oauthProvider.issuer'),
    authorizationURL: config.get('oauthProvider.auth.url'),
    tokenURL: config.get('oauthProvider.auth.tokenUrl'),
    userInfoURL: config.get('oauthProvider.auth.userInfo'),
    clientID: config.get('oauthProvider.client.id'),
    clientSecret: config.get('oauthProvider.client.secret'),
    callbackURL: config.get('oauthProvider.callbackUrl'),
    skipUserProfile: false,
    scope: 'profile email',
    profile: true,
    passReqToCallback: true,
  },
  verify
)

// careful, function arity matters https://github.com/jaredhanson/passport-openidconnect/blob/v0.1.2/lib/strategy.js#L245
// profile has this shape https://www.passportjs.org/reference/normalized-profile/
// when 'skipUserProfile' is set to false (aka: give us profile data)
/**
 *
 * @param {import('express').Request} req
 * @param {string} issuer
 * @param {import('passport').Profile} profile
 * @param {{{timestamp: number?, class: string?, methods: string[]?}}} context
 * @param {string} idToken
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {import('passport').DoneCallback} done
 * @returns {Promise<void>}
 */
async function verify(
  req,
  issuer,
  profile,
  context,
  idToken,
  accessToken,
  refreshToken,
  done
) {
  const { id, emails } = profile
  const { value: email } = emails[0] || {}

  const user = await User.findOne({
    $or: [
      // favourite connection, stable over time
      { 'authProviders.humanid.id': id },
      // legacy connection, prior to https://github.com/EcrituresNumeriques/stylo/issues/1074
      {
        'authProviders.humanid.id': null,
        'authProviders.humanid.email': email,
      },
    ],
  })

  const providerInfos = {
    id,
    email,
    token: accessToken,
  }

  if (user) {
    user.set({
      connectedAt: Date.now(),
      'authProviders.humanid': providerInfos,
    })

    return done(null, await user.save())
  }

  // trick to return no user but to let the onSuccess function decide what to do at response time
  // returning done(null, false) would trigger a 401, which is not what we want
  req.session.pendingRegistration = {
    email,
    authProviders: {
      humanid: providerInfos,
    },
  }

  return this.redirect(`/register/humanid?name=${profile.displayName}`)
}

module.exports = {
  strategy,
  verify,
}
