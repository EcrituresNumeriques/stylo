const jwt = require('jsonwebtoken')

const articleRoomRx = /^\/ws\/([a-f\d]{24})$/i

/**
 * Checks that a WebSocket upgrade request targets the room of an article.
 * The room name is "ws/{articleId}", and the article id is used as a MongoDB ObjectId.
 *
 * @param {string=} url request URL, e.g. "/ws/6afb023e23970475e33bd7c1?token=…"
 * @returns {boolean}
 */
function isArticleRoomUrl(url = '') {
  return articleRoomRx.test(url.split('?')[0])
}

/**
 * Checks that the token sent with a WebSocket upgrade request grants access to the article of the room.
 *
 * @param {string=} url request URL, e.g. "/ws/6afb023e23970475e33bd7c1?token=…"
 * @param {object} options
 * @param {string} options.jwtSecret
 * @returns {Promise<boolean>}
 */
async function canJoinArticleRoom(url = '', { jwtSecret }) {
  const [pathname, search = ''] = url.split('?')
  const articleId = articleRoomRx.exec(pathname)?.[1]
  const jwtToken = new URLSearchParams(search).get('token')
  if (!articleId || !jwtToken) {
    return false
  }

  let token
  try {
    token = jwt.verify(jwtToken, jwtSecret)
  } catch {
    return false
  }

  // required lazily to avoid loading the models and the resolvers when only the URL is checked
  const Article = require('../models/article.js')
  if (token.admin === true) {
    return (await Article.exists({ _id: articleId })) !== null
  }
  if (!token._id) {
    return false
  }
  const { getArticleByUser } = require('../resolvers/articleResolver.js')
  try {
    await getArticleByUser(articleId, token._id)
    return true
  } catch {
    return false
  }
}

module.exports = { isArticleRoomUrl, canJoinArticleRoom }
