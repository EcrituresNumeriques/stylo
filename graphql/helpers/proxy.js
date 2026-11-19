/**
 * `proxyReqOptDecorator` for express-http-proxy: removes the `Authorization` header,
 * so that the Stylo session token is not sent to a third-party service.
 *
 * @param {{ headers?: Record<string, string> }} proxyReqOpts
 * @returns {{ headers?: Record<string, string> }}
 */
function withoutAuthorizationHeader(proxyReqOpts) {
  if (proxyReqOpts.headers) {
    delete proxyReqOpts.headers.authorization
  }
  return proxyReqOpts
}

module.exports = { withoutAuthorizationHeader }
