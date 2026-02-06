exports.up = async function (db) {
  const adminDb = db._getDbInstance().admin()
  const serverInfo = await adminDb.serverInfo()
  const majorVersion = serverInfo.versionArray[0]
  if (majorVersion < 7) {
    await adminDb.command({
      setFeatureCompatibilityVersion: '6.0',
    })
  }
}

exports.down = async function (db) {
  const adminDb = db._getDbInstance().admin()
  const serverInfo = await adminDb.serverInfo()
  const majorVersion = serverInfo.versionArray[0]
  if (majorVersion < 7) {
    await adminDb.command({
      setFeatureCompatibilityVersion: '5.0',
    })
  }
}
