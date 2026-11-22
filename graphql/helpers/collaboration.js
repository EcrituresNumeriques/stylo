const articleRoomRx = /^\/ws\/[a-f\d]{24}$/i

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

module.exports = { isArticleRoomUrl }
