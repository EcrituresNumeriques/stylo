import * as Sentry from '@sentry/node'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'

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
export async function createJWTToken({ user, jwtSecret }) {
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

export function populateUserFromJWT({ jwtSecret }) {
  return async function populateUserFromJWTMiddleware(req, _res, next) {
    const jwtToken = req.headers.authorization?.replace(/^Bearer\s+/, '')

    if (!jwtToken) {
      return next()
    }

    // 1. Decode Token
    try {
      req.token = jwt.verify(jwtToken, jwtSecret)
    } catch {
      Sentry.setUser(null)

      return next()
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
