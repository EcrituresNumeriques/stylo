const { logger } = require('../logger')

async function logElapsedTime(action, actionName) {
  const startTime = performance.now()
  const result = await action()
  const elapsedTime = performance.now() - startTime
  logger.info({
    action: actionName,
    took: elapsedTime.toFixed(3),
  })
  return result
}

module.exports.logElapsedTime = logElapsedTime
