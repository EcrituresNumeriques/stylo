const pino = require('pino')
const logger = pino({
  serializers: {
    ...pino.stdSerializers,
    cause: pino.stdSerializers.err,
  }
})

module.exports = {
  logger
}
