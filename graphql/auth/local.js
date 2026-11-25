/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const LocalStrategy = require('passport-local').Strategy

const { createJWTToken } = require('../helpers/token.js')
const { checkCredentials } = require('../resolvers/authResolver.js')
const config = require('../config.js')

const strategy = new LocalStrategy({ passReqToCallback: true }, verify)

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

/**
 * @param {Request & { loginAccount?: object | null }} req
 * @param {string} username
 * @param {string} password
 * @param {Function} done
 */
async function verify(req, username, password, done) {
  try {
    // the account may have already been found by the login rate limit
    const user = await checkCredentials({
      username,
      password,
      account: req.loginAccount,
    })
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
