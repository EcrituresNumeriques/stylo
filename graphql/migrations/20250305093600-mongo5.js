exports.up = async function (db) {
  if (db.internals.dryRun) return
  const adminDb = db._getDbInstance().admin()
  const serverInfo = await adminDb.serverInfo()
  const majorVersion = serverInfo.versionArray[0]
  if (majorVersion < 6) {
    await adminDb.command({
      setFeatureCompatibilityVersion: '5.0',
    })
  }
}

exports.down = async function (db) {
  if (db.internals.dryRun) return
  const adminDb = db._getDbInstance().admin()
  const serverInfo = await adminDb.serverInfo()
  const majorVersion = serverInfo.versionArray[0]
  if (majorVersion < 6) {
    await adminDb.command({
      setFeatureCompatibilityVersion: '4.4',
    })
  }
}
