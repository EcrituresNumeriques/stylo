exports.up = async function (db) {
  const adminDb = db._getDbInstance().admin()
  await adminDb.command({
    setFeatureCompatibilityVersion: '4.4',
  })
}

exports.down = function () {
  return null
}
