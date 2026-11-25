const { renderStatsSprite } = require('../helpers/stats/svg.js')

/**
 * @param {object} options
 * @param {() => Promise<object>} options.getStats the stats, memoized by the caller
 * @param {import('../helpers/stats/charts.js').Chart[]} options.charts to draw
 * @returns {import('express').RequestHandler} the handler of `GET /stats.svg`;
 *   its errors go to the error handlers of Express (Sentry, then a 500)
 */
function createStatsSvgHandler({ getStats, charts }) {
  return async (_req, res) => {
    const stats = await getStats()
    res
      .type('image/svg+xml; charset=utf-8')
      .send(renderStatsSprite(stats, charts))
  }
}

/**
 * @param {Date} [now]
 * @returns {Date} the last second of the day, in UTC
 */
function endOfDay(now = new Date()) {
  const end = new Date(now)
  end.setUTCHours(23, 59, 59, 0)
  return end
}

module.exports = { createStatsSvgHandler, endOfDay }
