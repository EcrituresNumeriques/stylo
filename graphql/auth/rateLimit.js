const { rateLimit, ipKeyGenerator } = require('express-rate-limit')

const FIFTEEN_MINUTES = 15 * 60 * 1000

// HTTP status of a login refused because of wrong credentials
const FAILED_LOGIN_STATUS = new Set([401, 403])

/**
 * @param {import('express').Request} req
 * @returns {string}
 */
function ipKey(req) {
  return ipKeyGenerator(req.ip ?? '')
}

/**
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 */
function tooManyAttempts(_req, res) {
  res.status(429).json({
    error: 'TOO_MANY_ATTEMPTS',
    message: 'Too many failed login attempts, please try again later.',
  })
}

/**
 * Returns a middleware that stores in `req.loginAccount` the targeted account (or null),
 * and in `req.loginAccountKey` its key.
 * The key is the identifier of the account when it exists, so the username, the email
 * and the legacy display name of an account share the same counter.
 * Otherwise, it is the identifier typed by the user (trimmed and lower-cased).
 *
 * @param {(identifier: string) => Promise<{ id: string } | null>} findAccount
 * @returns {import('express').RequestHandler}
 */
function resolveLoginAccountKey(findAccount) {
  return async function resolveLoginAccountKeyMiddleware(req, _res, next) {
    const identifier = req.body?.username
    if (typeof identifier !== 'string' || identifier.trim() === '') {
      req.loginAccountKey = ''
      return next()
    }
    try {
      const account = await findAccount(identifier)
      // reused by the authentication, to avoid looking the account up twice
      req.loginAccount = account
      req.loginAccountKey = account
        ? `account:${account.id}`
        : `identifier:${identifier.trim().toLowerCase()}`
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

/**
 * Limits failed login attempts with three counters:
 * - per IP address, to slow down an attacker trying many accounts;
 * - per account and IP address, to slow down an attacker targeting one account;
 * - per account, with a much higher limit, to slow down a distributed attack.
 *
 * The per account and IP address counter is the strict one.
 * Failures from a few other IP addresses do not lock the account owner out,
 * but an attacker using many IP addresses can still reach the per account limit
 * and block the owner until the end of the window. This is the price of slowing down distributed attacks.
 *
 * Only failed attempts are counted, so a classroom sharing the same IP address
 * is not blocked as long as people type their password correctly.
 * The counters are kept in memory, they are reset when the server restarts.
 *
 * @param {object} options
 * @param {(identifier: string) => Promise<{ id: string } | null>} options.findAccount finds the account matching a login identifier
 * @param {boolean} [options.enabled] when false, no limit is applied
 * @param {number} [options.windowMs] duration of the window
 * @param {number} [options.maxFailuresPerIp] failed attempts allowed per IP address
 * @param {number} [options.maxFailuresPerIdentifierAndIp] failed attempts allowed per account and IP address
 * @param {number} [options.maxFailuresPerIdentifier] failed attempts allowed per account, all IP addresses together
 * @returns {import('express').RequestHandler[]}
 */
function loginRateLimit({
  findAccount,
  enabled = true,
  windowMs = FIFTEEN_MINUTES,
  maxFailuresPerIp = 50,
  maxFailuresPerIdentifierAndIp = 10,
  maxFailuresPerIdentifier = 100,
}) {
  if (!enabled) {
    return []
  }

  const common = {
    windowMs,
    // only wrong credentials are counted, not server errors (database down…) nor requests already blocked
    skipSuccessfulRequests: true,
    requestWasSuccessful: (_req, res) =>
      !FAILED_LOGIN_STATUS.has(res.statusCode),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: tooManyAttempts,
  }
  const withoutAccount = (req) => !req.loginAccountKey

  return [
    rateLimit({
      ...common,
      identifier: 'login-ip',
      limit: maxFailuresPerIp,
      keyGenerator: ipKey,
    }),
    resolveLoginAccountKey(findAccount),
    rateLimit({
      ...common,
      identifier: 'login-account-ip',
      limit: maxFailuresPerIdentifierAndIp,
      keyGenerator: (req) => `${req.loginAccountKey}|${ipKey(req)}`,
      skip: withoutAccount,
    }),
    rateLimit({
      ...common,
      identifier: 'login-account',
      limit: maxFailuresPerIdentifier,
      keyGenerator: (req) => req.loginAccountKey,
      skip: withoutAccount,
    }),
  ]
}

/**
 * In-memory counter of attempts, for checks that do not happen on a dedicated route
 * (for instance the current password in the `changePassword` mutation).
 * An attempt is counted before the check, and forgotten when the check succeeds,
 * so concurrent attempts cannot get around the limit.
 * The counters are reset when the server restarts.
 *
 * @param {object} [options]
 * @param {boolean} [options.enabled] when false, attempts are never refused
 * @param {number} [options.windowMs] duration of the window
 * @param {number} [options.limit] failed attempts allowed during the window
 */
function createFailureLimiter({
  enabled = true,
  windowMs = FIFTEEN_MINUTES,
  limit = 10,
} = {}) {
  /** @type {Map<string, { hits: number, resetAt: number }>} */
  const attempts = new Map()

  // expired counters are removed regularly, so the map only holds the keys of the current window
  const cleanup = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of attempts) {
      if (entry.resetAt <= now) attempts.delete(key)
    }
  }, windowMs)
  cleanup.unref?.()

  /**
   * @param {string} key
   */
  function current(key) {
    const entry = attempts.get(key)
    if (entry && entry.resetAt <= Date.now()) {
      attempts.delete(key)
      return undefined
    }
    return entry
  }

  return {
    /**
     * Counts an attempt. Returns false when the limit is reached, the attempt must then be refused.
     * The check and the increment are synchronous, so concurrent attempts are all counted.
     *
     * @param {string} key
     * @returns {boolean}
     */
    consume(key) {
      if (!enabled) {
        return true
      }
      const entry = current(key) ?? { hits: 0, resetAt: Date.now() + windowMs }
      entry.hits += 1
      attempts.set(key, entry)
      return entry.hits <= limit
    },

    /**
     * @param {string} key
     * @returns {boolean}
     */
    isBlocked(key) {
      return enabled && (current(key)?.hits ?? 0) >= limit
    },

    /**
     * Forgets the attempts of a key, after a successful check.
     *
     * @param {string} key
     */
    reset(key) {
      attempts.delete(key)
    },
  }
}

module.exports = { loginRateLimit, createFailureLimiter }
