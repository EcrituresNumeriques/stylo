const jwt = require('jsonwebtoken')
const { getArticleByContext } = require('../resolvers/articleResolver.js')

/**
 * Authorizes an incoming collaborative-editing WebSocket upgrade request.
 *
 * The room name has the form `ws/{articleId}` (see `graphql/app.js`'s Yjs
 * persistence setup). Access is granted only to the article's owner, a
 * contributor, or a member of a workspace containing the article — the same
 * rule enforced by `getArticleByContext` for the GraphQL API — or to an
 * admin token.
 *
 * @param {import('http').IncomingMessage} request
 * @param {string} jwtSecret
 * @returns {Promise<boolean>} whether the upgrade is authorized
 */
module.exports.authorizeUpgrade = async function authorizeUpgrade(
  request,
  jwtSecret
) {
  const roomName = (request.url || '').slice(1).split('?')[0]
  const articleId = roomName.split('/')[1] // format: ws/{articleId}
  const jwtToken = new URL(
    request.url || '',
    'http://localhost'
  ).searchParams.get('token')

  let token
  try {
    token = jwtToken && jwt.verify(jwtToken, jwtSecret)
  } catch {
    return false
  }

  if (!token) {
    return false
  }

  try {
    await getArticleByContext(articleId, { token, userId: token._id })
    return true
  } catch {
    return false
  }
}
