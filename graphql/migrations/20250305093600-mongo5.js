exports.up = async function (db) {
  const adminDb = db._getDbInstance().admin()
  await adminDb.command({
    setFeatureCompatibilityVersion: '5.0',
  })
}

exports.down = async function (db) {
  const adminDb = db._getDbInstance().admin()
  await adminDb.command({
    setFeatureCompatibilityVersion: '4.4',
  })
}
