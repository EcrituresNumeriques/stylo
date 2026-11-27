const localAuth = require('./local.js')
const zoteroAuth = require('./zotero.js')
const hypothesisAuth = require('./hypothesis.js')
const humanidAuth = require('./humanid.js')
const { createJWTToken } = require('../helpers/token.js')
const Sentry = require('@sentry/node')

const config = require('../config.js')
const { logger } = require('../logger.js')

/**
 * Resolves the origin to redirect back to after authentication, from the
 * `Origin` or `Referer` request header.
 *
 * The header is attacker-controlled (a third-party page linking to
 * `/login/<service>` sets its own `Referer`), so the resulting origin is
 * only trusted when it exactly matches one of the configured CORS origins
 * (`security.cors.origin`) — the same allow-list used to decide whether a
 * cross-origin request is allowed to read the session cookie.
 *
 * @param {import('express').Request} req
 * @return {string|null} the allowed origin, or `null` if the header is
 *   missing, malformed, or not in the allow-list
 */
function resolveAllowedOrigin(req) {
  const headerValue = req.header('origin') || req.header('referer')
  if (!headerValue) {
    return null
  }

  let candidate
  try {
    const url = new URL(headerValue)
    candidate = `${url.protocol}//${url.host}`
  } catch {
    return null
  }

  const allowedOrigins = config.get('security.cors.origin')
  const isAllowed = allowedOrigins.some((origin) => origin.test(candidate))

  return isAllowed ? candidate : null
}

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
    // enables dynamic redirect based on the Stylo instance which originated the request
    // this way it also works on dynamic netlify deployments
    const origin = resolveAllowedOrigin(req)
    if (!origin) {
      return res.status(400).send('Invalid or disallowed Origin/Referer header.')
    }
    req.session.origin = origin

    delete req.session.fromAccount

    // mark a multi-step request as originating from a logged in account (`passport.authorize()` scheme)
    if (alreadyLoggedIn) {
      req.session.fromAccount = service
    }

    return next()
  }
}

/**
 * Handles the errors of the external authentication callbacks (HumanID, Hypothesis, Zotero):
 * the authentication was refused (`failWithError`) or the verify function failed.
 * The user is sent back to Stylo instead of being left on a raw error page of the API.
 *
 * @type {import('express').ErrorRequestHandler}
 */
function onAuthFailure(error, req, res, _next) {
  // authentication refused by the service (or cancelled by the user) is expected,
  // any other error is not
  if (error?.name !== 'AuthenticationError') {
    Sentry.captureException(error)
  }
  logger.warn({ err: error }, 'External authentication failed')

  const origin = req.session?.origin
  if (!origin) {
    res.status(401).send('Authentication failed')
    return
  }

  // the error message stays in the logs, it may contain internal details
  res.redirect(
    req.session.fromAccount
      ? `${origin}/credentials/auth-callback/${req.session.fromAccount}`
      : `${origin}/login#auth-error`
  )
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
  resolveAllowedOrigin,
  stampAuth,
  onAuthFailure,
  onAuthSuccess,
  // auth strategies
  localAuth,
  zoteroAuth,
  hypothesisAuth,
  humanidAuth,
}
