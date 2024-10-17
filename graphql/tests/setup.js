const migrate = require('db-migrate')

module.exports = async function globalSetup () {
  const migrateInstance = migrate.getInstance(true)
  migrateInstance.silence(true)
  await migrateInstance.reset()
  await migrateInstance.up()
}
