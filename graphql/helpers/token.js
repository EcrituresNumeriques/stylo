const jwt = require('jsonwebtoken')
const User = require('../models/user')

module.exports.createJWTToken = async function createJWTToken ({ email, jwtSecret}) {
  const user = await User.findOne({ email })

  // generate a JWT token
  const payload = {
    email,
    _id: user._id,
    authType: user.authType,
    admin: Boolean(user.admin),
    session: true,
  }

  return jwt.sign(payload, jwtSecret)
}

module.exports.populateUserFromJWT = function populateUserFromJWT ({ jwtSecret }) {
  return function populateUserFromJWTMiddleware(req, res, next) {
    const jwtToken = req.headers.authorization?.replace(/^Bearer /, '')

    if (typeof jwtToken === 'string') {
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
