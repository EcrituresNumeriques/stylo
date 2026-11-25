exports.up = async function (db) {
  if (db.internals.dryRun) return
  const mongo = db._getDbInstance()
  await mongo.collection('users').updateMany({}, { $unset: { admin: '' } })
}

exports.down = async function (db) {
  if (db.internals.dryRun) return
  const mongo = db._getDbInstance()
  await mongo.collection('users').updateMany({}, { $set: { admin: false } })
}
