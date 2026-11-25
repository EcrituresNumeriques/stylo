exports.up = async function (db) {
  if (db.internals.dryRun) return
  const adminDb = db._getDbInstance().admin()
  await adminDb.command({
    setFeatureCompatibilityVersion: '7.0',
    confirm: true,
  })
}

exports.down = async function (db) {
  if (db.internals.dryRun) return
  const adminDb = db._getDbInstance().admin()
  await adminDb.command({
    setFeatureCompatibilityVersion: '6.0',
  })
}
