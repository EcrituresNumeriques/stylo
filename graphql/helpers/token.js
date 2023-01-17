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
  return async function populateUserFromJWTMiddleware(req, res, next) {
    const jwtToken = req.headers.authorization?.replace(/^Bearer /, '')

    if (!jwtToken) {
      return next()
    }

    // 1. Decode Token
    try {
      req.token = jwt.verify(jwtToken, jwtSecret)
    } catch (error) {
      res.status(400)
      return next(error)
    }

    // 2. Fetch associated user, only if not populated by Passport Session before
    if (req.token._id && !req.user) {
      req.user = await User.findById(req.token._id).populate({ path: 'permissions grantees' })
      // question: should we throw an error is the user does not exist?
    }

    return next()
  }
}
