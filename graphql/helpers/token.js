const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Password = require('../models/user_password')

const DEFAULT_OPTIONAL_PAYLOAD = {
  zoteroToken: null
}

module.exports.createJWTToken = async function createJWTToken ({ email, jwtSecret}, optionalPayload = DEFAULT_OPTIONAL_PAYLOAD) {
  const user = await User.findOne({ email })
  const userPassword = await Password.findOne({ email }).populate("users")

  // generate a JWT token
  const payload = {
    email,
    usersIds: userPassword.users.map(user => user._id.toString()),
    passwordId: userPassword.id,
    admin: Boolean(user.admin),
    session: true,
    ...optionalPayload
  }

  return jwt.sign(
    payload,
    jwtSecret
  )
}

module.exports.populateUserFromJWT = function populateUserFromJWT ({ jwtSecret }) {
  return function populateUserFromJWTMiddleware(req, res, next) {
    const jwtToken = req.headers.authorization
      ? req.headers.authorization.replace(/^Bearer /, '')
      : req.cookies['graphQL-jwt']

    if (jwtToken) {
      try {
        // this overrides the `passport.deserializeUser()` user session object
        // so use it in a stateless environment, like the GraphQL API
        req.user = jwt.verify(jwtToken, jwtSecret)
      } catch (error) {
        return next(error)
      }
    }

    return next()
  }
}
