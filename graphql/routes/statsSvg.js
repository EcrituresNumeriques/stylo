const Sentry = require('@sentry/node')

const { renderStatsSprite } = require('../helpers/stats/svg.js')

/**
 * @param {object} options
 * @param {(now: number) => Promise<{ computedAt: Date }>} options.getStats cached stats
 * @param {number} options.cacheDuration of the stats, in milliseconds
 * @param {import('../helpers/stats/charts.js').Chart[]} options.charts to draw
 * @param {() => number} [options.now]
 * @returns {import('express').RequestHandler} the handler of `GET /stats.svg`,
 *   cached by the browsers until the stats are computed again
 */
function createStatsSvgHandler({
  getStats,
  cacheDuration,
  charts,
  now = Date.now,
}) {
  return async (_req, res) => {
    try {
      const time = now()
      const stats = await getStats(time)
      const age = time - new Date(stats.computedAt).getTime()
      const maxAge = Math.max(0, Math.floor((cacheDuration - age) / 1000))
      res
        .type('image/svg+xml; charset=utf-8')
        .set('Cache-Control', `public, max-age=${maxAge}`)
        .send(renderStatsSprite(stats, charts))
    } catch (error) {
      Sentry.captureException(error)
      res.sendStatus(500)
    }
  }
}

module.exports = { createStatsSvgHandler }
