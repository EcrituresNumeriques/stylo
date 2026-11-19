const config = require('../config.js')

/**
 * @typedef {'off' | 'on' | 'opt-in'} FeatureState
 */

/**
 * @param {string} name
 * @returns {boolean}
 */
function isKnownFeature(name) {
  return Object.hasOwn(config.get('features'), name)
}

/**
 * @returns {{ name: string, state: FeatureState }[]}
 */
function getFeatureStates() {
  return Object.entries(config.get('features')).map(([name, state]) => ({
    name,
    state,
  }))
}

/**
 * Tells if a feature is enabled for a user:
 * - "on" for the instance: enabled for everyone
 * - "opt-in" for the instance: enabled if the user requested it (User.features)
 * - "off" for the instance, or unknown feature: disabled
 *
 * @param {string} name
 * @param {{ features?: string[] } | null | undefined} user
 * @returns {boolean}
 */
function isFeatureEnabled(name, user) {
  if (!isKnownFeature(name)) {
    return false
  }

  const state = config.get('features')[name]

  if (state === 'on') {
    return true
  }

  if (state === 'opt-in') {
    return user?.features?.includes(name) ?? false
  }

  return false
}

/**
 * Lists the features enabled for a user.
 *
 * @param {{ features?: string[] } | null | undefined} user
 * @returns {string[]}
 */
function resolveFeatures(user) {
  return getFeatureStates()
    .map(({ name }) => name)
    .filter((name) => isFeatureEnabled(name, user))
}

/**
 * Express middleware restricting a route to users with an enabled feature.
 * Must be placed after `populateUserFromJWT()`, which sets `req.user`.
 *
 * @param {string} name
 * @returns {import('express').RequestHandler}
 */
function requireFeature(name) {
  return function requireFeatureMiddleware(req, res, next) {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unable to find an authentication context.' })
    }

    if (!isFeatureEnabled(name, req.user)) {
      return res.status(403).json({ error: `Feature "${name}" is disabled.` })
    }

    return next()
  }
}

module.exports = {
  getFeatureStates,
  isFeatureEnabled,
  isKnownFeature,
  requireFeature,
  resolveFeatures,
}
