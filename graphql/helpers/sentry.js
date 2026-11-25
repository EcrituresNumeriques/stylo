const {
  FILTERED,
  scrubQuery,
  scrubText,
  scrubUrl,
  scrubValue,
} = require('./redaction.js')

const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'set-cookie'])

/**
 * @param {unknown} data request body, as an object or as a (JSON) string
 * @returns {unknown}
 */
function scrubRequestData(data) {
  if (typeof data !== 'string') {
    return scrubValue(data)
  }
  try {
    return JSON.stringify(scrubValue(JSON.parse(data)))
  } catch {
    return scrubText(data)
  }
}

/**
 * @param {import('@sentry/node').Event['request']} request
 */
function scrubRequest(request) {
  if (request.headers) {
    for (const name of Object.keys(request.headers)) {
      if (SENSITIVE_HEADERS.has(name.toLowerCase())) {
        request.headers[name] = FILTERED
      }
    }
  }
  if (request.cookies) {
    request.cookies = {}
  }
  if (typeof request.query_string === 'string') {
    request.query_string = scrubUrl(request.query_string)
  } else if (request.query_string) {
    request.query_string = scrubQuery(request.query_string)
  }
  if (typeof request.url === 'string') {
    request.url = scrubUrl(request.url)
  }
  if (request.data !== undefined) {
    request.data = scrubRequestData(request.data)
  }
}

/**
 * Removes credentials (tokens, cookies, passwords, OAuth codes) from a Sentry event or transaction
 * before it leaves the server: request (headers, cookies, URL, body), messages, exceptions
 * (message and local variables of the stack frames), breadcrumbs, spans and extra data.
 * The Sentry project scrubs data server-side too, but we do not want to depend on its settings.
 *
 * @template {import('@sentry/node').Event} T
 * @param {T} event
 * @returns {T}
 */
function scrubEvent(event) {
  if (event.request) {
    scrubRequest(event.request)
  }

  if (typeof event.message === 'string') {
    event.message = scrubText(event.message)
  }
  if (event.logentry) {
    if (typeof event.logentry.message === 'string') {
      event.logentry.message = scrubText(event.logentry.message)
    }
    if (event.logentry.params) {
      event.logentry.params = scrubValue(event.logentry.params)
    }
  }

  for (const exception of event.exception?.values ?? []) {
    if (typeof exception.value === 'string') {
      exception.value = scrubText(exception.value)
    }
    for (const frame of exception.stacktrace?.frames ?? []) {
      if (frame.vars) {
        frame.vars = scrubValue(frame.vars)
      }
    }
  }

  for (const breadcrumb of event.breadcrumbs ?? []) {
    if (typeof breadcrumb.message === 'string') {
      breadcrumb.message = scrubText(breadcrumb.message)
    }
    if (breadcrumb.data) {
      breadcrumb.data = scrubValue(breadcrumb.data)
    }
  }

  for (const span of event.spans ?? []) {
    if (span.data) {
      span.data = scrubValue(span.data)
    }
    if (typeof span.description === 'string') {
      span.description = scrubText(span.description)
    }
  }

  if (event.contexts?.trace?.data) {
    event.contexts.trace.data = scrubValue(event.contexts.trace.data)
  }
  if (event.extra) {
    event.extra = scrubValue(event.extra)
  }
  if (typeof event.transaction === 'string') {
    event.transaction = scrubUrl(event.transaction)
  }

  return event
}

module.exports = { scrubEvent }
