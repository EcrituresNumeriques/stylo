exports.up = function (db) {
  return db._run('executeDbAdminCommand', {
    setFeatureCompatibilityVersion: '5.0',
  })
}

exports.down = function (db) {
  return db._run('executeDbAdminCommand', {
    setFeatureCompatibilityVersion: '4.4',
  })
}
