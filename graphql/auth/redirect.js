/**
 * Builds the URL of the registration page, after a successful authentication
 * with an external service that is not yet linked to a Stylo account.
 *
 * The name comes from the external service: it may contain spaces or accents,
 * which are not allowed as-is in the Location header of a redirection.
 *
 * @param {string} origin Stylo frontend origin
 * @param {'humanid' | 'hypothesis' | 'zotero'} service
 * @param {string=} name name (or username) returned by the service
 * @returns {string}
 */
function registrationUrl(origin, service, name) {
  const query = name ? `?${new URLSearchParams({ name })}` : ''
  return `${origin}/register/${service}${query}`
}

module.exports = { registrationUrl }
