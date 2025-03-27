const localAuth = require('./local.js')
const zoteroAuth = require('./zotero.js')
const hypothesisAuth = require('./hypothesis.js')
const humanidAuth = require('./humanid.js')
const { createJWTToken } = require('../helpers/token.js')
const config = require('../config.js')

/**
 * Help auth handler recognize if we are in an account creation
 * or in an account linking process.
 * @type {import('express').RequestHandler}
 */
function markAsFromAccount(service) {
  return function handler(req, res, next) {
    req.session.fromAccount = service

    next()
  }
}

function onAuthFailure(error, req, res) {
  res.statusCode = 401

  res.redirect('/login#error&message=' + error.message)
}

async function onAuthSuccess(req, res) {
  if (req.session.fromAccount) {
    const service = req.session.fromAccount

    req.session.pendingRegistration = {
      authProviders: {
        [service]: req.account.authProviders
          .get(service)
          .toObject({ flattenMaps: true }),
      },
    }

    return res.redirect(`/credentials/auth-callback/${service}`)
  }

  const token = await createJWTToken({
    user: req.account,
    jwtSecret: config.get('security.jwt.secret'),
  })

  return res.redirect(`/login#auth-token=${token}`)
}

module.exports = {
  markAsFromAccount,
  onAuthFailure,
  onAuthSuccess,
  // auth strategies
  localAuth,
  zoteroAuth,
  hypothesisAuth,
  humanidAuth,
}
