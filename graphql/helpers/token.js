const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Sentry = require('@sentry/node')
const { ApiError } = require('./errors.js')
const Corpus = require('../models/corpus')
const { NotFoundError } = require('./errors')

/**
 * @typedef {Object} RequestContext
 * @property {import('express-session').Session} session
 * @property {string} token
 * @property {import('../models/user.js')} user
 * @property {string?} userId
 * @property {import('../loaders.js').createLoaders()} loaders
 */

/**
 *
 * @param {Object} params
 * @param {User} params.user
 * @param {string} params.jwtSecret
 * @returns {Promise<string>}
 */
module.exports.createJWTToken = async function createJWTToken({
  user,
  jwtSecret,
}) {
  const payload = {
    email: user.email,
    _id: user._id,
    session: true,
  }

  return jwt.sign(
    payload,
    jwtSecret /*, {
    expiresIn: '30d',
  }*/
  )
}

module.exports.enforceUser = function enforceUser() {
  return function enforceUserMiddleware(req, res, next) {
    if (!req.user) {
      res.status(401)
      res.set('www-authenticate', 'Basic realm="Stylo"')
      return next(new ApiError('UNAUTHORIZED'))
    }

    return next()
  }
}

function extractToken(authorization) {
  if (authorization) {
    if (authorization.startsWith('Basic ')) {
      const basicAuth = Buffer.from(
        authorization.replace(/^Basic\s+/, ''),
        'base64'
      ).toString('ascii')
      return basicAuth.split(':')[1]
    }
    if (authorization.startsWith('Bearer ')) {
      return authorization?.replace(/^Bearer\s+/, '')
    }
  }
}

module.exports.populateUserFromJWT = function populateUserFromJWT({
  jwtSecret,
}) {
  return async function populateUserFromJWTMiddleware(req, res, next) {
    const jwtToken = extractToken(req.headers.authorization)

    if (!jwtToken) {
      return next()
    }

    // 1. Decode Token
    try {
      req.token = jwt.verify(jwtToken, jwtSecret)
    } catch {
      Sentry.setUser(null)
      res.status(403)
      return next(new ApiError('Unauthorized'))
    }

    // 2. Fetch associated user, only if not populated by Passport Session before
    if (req.token._id && !req.user) {
      req.user = await User.findOne({ _id: req.token._id }).orFail(() => {
        res.status(403)
        return new ApiError('Unauthorized')
      })
      Sentry.setUser(req.user ? { id: req.user?._id } : null)
    }

    return next()
  }
}
