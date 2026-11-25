/**
 * Helpers to remove credentials (passwords, tokens, OAuth codes, cookies)
 * from the data sent to the logs and to Sentry.
 */

const FILTERED = '[Filtered]'

/**
 * Names of object keys and variables holding credentials.
 * `old` and `new` are the deprecated arguments of `changePassword`.
 */
const SENSITIVE_NAME =
  /pass(word)?|token|secret|authorization|cookie|jwt|verifier|^(old|new)$/i

/**
 * Names of URL parameters holding credentials.
 * `code`, `state` and `oauth_verifier` come from the OAuth callbacks.
 */
const SENSITIVE_PARAM_NAME = /token|pass(word)?|secret|verifier|^(code|state)$/i

const SENSITIVE_URL_PARAM =
  /([?&#;](?:[^=&#;]*(?:token|pass(?:word)?|secret|verifier)[^=&#;]*|code|state)=)[^&#;]*/gi

/**
 * Credentials written as literals in a JSON document or a GraphQL query,
 * e.g. `password: "…"`, `"newPassword":"…"`, `old: """…"""` or `\"password\":\"…\"` (JSON encoded twice).
 */
const SENSITIVE_LITERAL =
  /(\\?"?)\b(\w*(?:pass(?:word)?|token|secret)\w*|old|new)(\\?"?)(\s*:\s*)("""[\s\S]*?"""|\\"(?:[^"\\]|\\(?!")[\s\S])*?\\"|"(?:[^"\\]|\\.)*")/gi

const BEARER = /\b(Bearer\s+)[\w~+/.-]+=*/gi

const JWT = /\beyJ[\w-]*\.[\w-]+\.[\w-]+/g

const MAX_DEPTH = 10

/**
 * @param {string} name
 * @returns {boolean}
 */
function isSensitiveName(name) {
  return SENSITIVE_NAME.test(name)
}

/**
 * Removes the values of the sensitive parameters of a URL, a query string or a URL fragment.
 *
 * @param {string} url
 * @returns {string}
 */
function scrubUrl(url) {
  const prefixed = /^[?&#;]/.test(url) || url.includes('?') || url.includes('#')
  if (prefixed) {
    return url.replace(SENSITIVE_URL_PARAM, `$1${FILTERED}`)
  }
  // a bare query string, e.g. "token=…&articleId=…"
  return `?${url}`.replace(SENSITIVE_URL_PARAM, `$1${FILTERED}`).slice(1)
}

/**
 * Removes the credentials found in a text: URL parameters, literals (JSON document, GraphQL query),
 * bearer tokens and JSON Web Tokens.
 *
 * @param {string} text
 * @returns {string}
 */
function scrubText(text) {
  return scrubUrl(text)
    .replace(
      SENSITIVE_LITERAL,
      (_match, quote, name, endQuote, separator, value) => {
        const filtered = value.startsWith('\\"')
          ? `\\"${FILTERED}\\"`
          : `"${FILTERED}"`
        return `${quote}${name}${endQuote}${separator}${filtered}`
      }
    )
    .replace(BEARER, `$1${FILTERED}`)
    .replace(JWT, FILTERED)
}

/**
 * Returns a copy of a value where every sensitive key is filtered,
 * and where the credentials found in strings are removed.
 * The value itself is never modified.
 *
 * @param {unknown} value
 * @param {number} [depth]
 * @returns {unknown}
 */
function scrubValue(value, depth = 0) {
  if (typeof value === 'string') {
    return scrubText(value)
  }
  if (value === null || typeof value !== 'object') {
    return value
  }
  if (depth >= MAX_DEPTH) {
    return FILTERED
  }
  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, depth + 1))
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      isSensitiveName(key) ? FILTERED : scrubValue(item, depth + 1),
    ])
  )
}

/**
 * Returns a copy of the parameters of a URL (e.g. `req.query`) without the credentials.
 *
 * @param {unknown} query
 * @returns {unknown}
 */
function scrubQuery(query) {
  if (query === null || typeof query !== 'object' || Array.isArray(query)) {
    return scrubValue(query)
  }
  return Object.fromEntries(
    Object.entries(query).map(([key, item]) => [
      key,
      isSensitiveName(key) || SENSITIVE_PARAM_NAME.test(key)
        ? FILTERED
        : scrubValue(item),
    ])
  )
}

module.exports = {
  FILTERED,
  isSensitiveName,
  scrubQuery,
  scrubText,
  scrubUrl,
  scrubValue,
}
