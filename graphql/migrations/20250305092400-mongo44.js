exports.up = async function (db) {
  return db._run('executeDbAdminCommand', {
    setFeatureCompatibilityVersion: '4.4',
  })
}

exports.down = function () {
  return null
}
