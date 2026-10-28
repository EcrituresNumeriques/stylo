/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const LocalStrategy = require('passport-local').Strategy

const { createJWTToken } = require('../helpers/token.js')
const { checkCredentials } = require('../resolvers/authResolver.js')
const config = require('../config.js')

const strategy = new LocalStrategy({ session: false }, verify)

/**
 *
 * @param {Error} error
 * @param {Request} _req
 * @param {Error} res
 */
function onFailure(error, _req, res) {
  res.statusCode = 401
  res.json({ error })
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function onSuccess(req, res) {
  req.user.connectedAt = Date.now()
  await req.user.save()

  const token = await createJWTToken({
    user: req.user,
    jwtSecret: config.get('security.jwt.secret'),
  })

  res.statusCode = 200
  res.json({ user: toPublicUser(req.user), token })
}

/**
 * Only expose the public profile of the user
 * (never the password hash nor the auth providers tokens).
 *
 * @param {import('mongoose').HydratedDocument<import('../models/user.js')>} user
 * @returns {Record<string, any>}
 */
function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    institution: user.institution,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

async function verify(username, password, done) {
  try {
    const user = await checkCredentials({ username, password })
    return done(null, user)
  } catch (error) {
    return done(error)
  }
}

module.exports = {
  onFailure,
  onSuccess,
  strategy,
  verify,
}
