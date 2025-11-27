exports.up = async function (db) {
  const adminDb = db._getDbInstance().admin()
  const result = await adminDb.command({
    getParameter: 1,
    featureCompatibilityVersion: 1,
  })
  const majorVersion = parseInt(
    result.featureCompatibilityVersion.version.split('.')[0]
  )
  if (majorVersion < 5) {
    await adminDb.command({
      setFeatureCompatibilityVersion: '4.4',
    })
  }
}

exports.down = function () {
  return null
}
