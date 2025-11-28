exports.up = async function (db) {
  const adminDb = db._getDbInstance().admin()
  const serverInfo = await adminDb.serverInfo()
  const majorVersion = serverInfo.versionArray[0]
  if (majorVersion < 5) {
    await adminDb.command({
      setFeatureCompatibilityVersion: '4.4',
    })
  }
}

exports.down = function () {
  return null
}
