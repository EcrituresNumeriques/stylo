const localAuth = require('./local.js')
const zoteroAuth = require('./zotero.js')
const hypothesisAuth = require('./hypothesis.js')
const humanidAuth = require('./humanid.js')
const { createJWTToken } = require('../helpers/token.js')
const config = require('../config.js')

/**
 * Help auth handler recognize if we are in an account creation
 * or in an account linking process.
 *
 * @param {string} service
 * @param {Object?} options
 * @param {boolean?} options.alreadyLoggedIn
 * @return {import('express').RequestHandler}
 */
function stampAuth(service, { alreadyLoggedIn = false } = {}) {
  return function handler(req, res, next) {
    // enables dynamic redirect based on the Styll instance which originated the request
    // this way it also works on dynamic netlify deployments
    const origin = new URL(req.header('origin') || req.header('referer'))
    req.session.origin = `${origin.protocol}//${origin.host}`

    // mark a multi-step request as originating from a logged in account (`passport.authorize()` scheme)
    if (alreadyLoggedIn) {
      req.session.fromAccount = service
    }

    return next()
  }
}

/**
 * @type {import('express').RequestHandler}
 */
function onAuthFailure(error, req, res) {
  res.statusCode = 401

  res.redirect(`${res.session.origin}/login#error&message=${error.message}`)
}

/**
 *
 * @type {import('express').RequestHandler}
 */
async function onAuthSuccess(req, res) {
  // this is likely to mean that we already have an account with this user
  // and that we are trying to link it against another Stylo account
  if (req.session.fromAccount) {
    const service = req.session.fromAccount

    req.session.pendingRegistration = {
      authProviders: {
        [service]: req.account.authProviders
          .get(service)
          .toObject({ flattenMaps: true }),
      },
    }

    return res.redirect(
      `${req.session.origin}/credentials/auth-callback/${service}`
    )
  }

  const token = await createJWTToken({
    user: req.account,
    jwtSecret: config.get('security.jwt.secret'),
  })

  return res.redirect(`${req.session.origin}/login#auth-token=${token}`)
}

module.exports = {
  stampAuth,
  onAuthFailure,
  onAuthSuccess,
  // auth strategies
  localAuth,
  zoteroAuth,
  hypothesisAuth,
  humanidAuth,
}
