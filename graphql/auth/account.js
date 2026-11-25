const { createAccess } = require('../helpers/accesses.js')

/**
 * Updates the external service data of a known Stylo account. Does not save.
 *
 * Linking a service from an already logged in account (`/authorize`)
 * is not an access to Stylo: an access is recorded on login only.
 *
 * @param {import('express').Request} req
 * @param {import('../models/user.js')} user
 * @param {'humanid' | 'hypothesis' | 'zotero'} strategy
 * @param {object} providerInfos data returned by the service
 */
function updateProviderAccount(req, user, strategy, providerInfos) {
  user.mergeAuthProvider(strategy, providerInfos)
  if (!req.session.fromAccount) {
    user.recordAccess(createAccess({ ip: req.ip, strategy }))
  }
}

module.exports = { updateProviderAccount }
