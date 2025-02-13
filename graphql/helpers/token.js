const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Sentry = require('@sentry/node')

module.exports.createJWTToken = async function createJWTToken({
  user,
  jwtSecret,
}) {
  // generate a JWT token
  const payload = {
    email: user.email,
    _id: user._id,
    authType: user.authType,
    session: true,
  }

  return jwt.sign(payload, jwtSecret)
}

module.exports.populateUserFromJWT = function populateUserFromJWT({
  jwtSecret,
}) {
  return async function populateUserFromJWTMiddleware(req, res, next) {
    const jwtToken = req.headers.authorization?.replace(/^Bearer\s+/, '')

    if (!jwtToken) {
      return next()
    }

    // 1. Decode Token
    try {
      req.token = jwt.verify(jwtToken, jwtSecret)
    } catch (error) {
      Sentry.setUser(null)

      res.status(400)
      return res.json(error)
    }

    // 2. Fetch associated user, only if not populated by Passport Session before
    if (req.token._id && !req.user) {
      // question: should we throw an error is the user does not exist?
      req.user = await User.findById(req.token._id)

      Sentry.setUser(req.user ? { id: req.user?._id } : null)
    }

    return next()
  }
}
