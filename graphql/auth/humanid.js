const { ApiError } = require('../helpers/errors')
const User = require('../models/user.js')
const config = require('../config.js')
const OidcStrategy = require('passport-openidconnect').Strategy

const strategy = new OidcStrategy(
  {
    name: config.get('oauthProvider.name'),
    issuer: config.get('oauthProvider.issuer'),
    authorizationURL: config.get('oauthProvider.auth.url'),
    tokenURL: config.get('oauthProvider.auth.tokenUrl'),
    userInfoURL: config.get('oauthProvider.auth.userInfo'),
    clientID: config.get('oauthProvider.client.id'),
    clientSecret: config.get('oauthProvider.client.secret'),
    callbackURL: config.get('oauthProvider.callbackUrl'),
    skipUserProfile: false,
    scope: config.get('oauthProvider.scope'),
  },
  verify
)

function onFailure(error, req, res) {
  res.redirect(
    `/credentials/auth-callback/humanid#type=error&message=${error.message}`
  )
}

async function onSuccess(req, res) {
  const token = await createJWTToken({ user: req.user, jwtSecret })
  return res.redirect(`/credentials/auth-callback/humanid#auth-token=${token}`)
}

async function verify(
  iss,
  profile,
  context,
  idToken,
  accessToken,
  refreshToken,
  done
) {
  // careful, function arity matters https://github.com/jaredhanson/passport-openidconnect/blob/v0.1.2/lib/strategy.js#L245
  // profile has this shape https://www.passportjs.org/reference/normalized-profile/
  // when 'skipUserProfile' is set to false (aka: give us profile data)
  const { id, name, displayName } = profile
  const { value: email } = profile.emails[0] || {}

  if (!email) {
    throw new ApiError('Cannot find or create a user without email address.')
  }

  let user = await User.findOne({
    $or: [
      // favourite connection, stable over time
      { 'authProviders.humanid.id': id },
      // legacy connection, prior to https://github.com/EcrituresNumeriques/stylo/issues/1074
      { 'authProviders.humanid.email': email },
    ],
  })

  const providerInfos = {
    id,
    email,
    token: accessToken,
    updatedAt: Date.now(),
  }

  // update user with more up to date values
  if (user) {
    user.set({
      connectedAt: Date.now(),
      'authProviders.humanid': providerInfos,
    })
    user = await user.save()
    return done(null, user)
  }
  user = new User({
    email,
    connectedAt: Date.now(),
    displayName,
    firstName: name.givenName || '',
    lastName: name.familyName || '',
    'authProviders.humanid': providerInfos,
  })

  await user.save()
  await user.createDefaultArticle()

  // this will be stored in session via `serializeUser()`
  return done(null, user)
}

module.exports = {
  onFailure,
  onSuccess,
  strategy,
  verify,
}
