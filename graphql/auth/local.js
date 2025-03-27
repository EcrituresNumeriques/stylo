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
 * @param {Request} req
 * @param {Error} res
 */
function onFailure(error, req, res) {
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
  res.json({ user: req.user, token })
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
