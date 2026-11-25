const pino = require('pino')
const { scrubQuery, scrubText, scrubUrl } = require('./helpers/redaction.js')

const REDACTED = '[Redacted]'

/**
 * Credentials must never end up in the logs.
 * The URLs may carry credentials, for instance the OAuth callbacks (`?code=…`, `?oauth_verifier=…`)
 * or the redirection to Stylo with the session token in the fragment (`#auth-token=…`).
 */
const redact = {
  paths: [
    'req.headers.authorization',
    'req.headers.cookie',
    'res.headers["set-cookie"]',
    'req.url',
    'req.query',
    'res.headers.location',
    'err.message',
    'err.stack',
  ],
  /**
   * The value is never modified: pino gives the same object as the request.
   *
   * @param {unknown} value
   * @param {string[]} path
   * @returns {unknown}
   */
  censor(value, path) {
    const name = path.at(-1)
    if ((name === 'url' || name === 'location') && typeof value === 'string') {
      return scrubUrl(value)
    }
    if (name === 'query') {
      return scrubQuery(value)
    }
    // an error message may contain a URL with an OAuth code or a token
    if ((name === 'message' || name === 'stack') && typeof value === 'string') {
      return scrubText(value)
    }
    return REDACTED
  },
}

const logger = pino({ redact })

module.exports = {
  logger,
  redact,
}
