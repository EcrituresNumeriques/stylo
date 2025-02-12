exports.up = async function (db) {
  const mongo = await db._run('getDbInstance', true)
  try {
    await mongo.collection('users').updateMany({}, { $unset: { admin: '' } })
  } finally {
    await mongo.close()
  }
}

exports.down = async function (db) {
  const mongo = await db._run('getDbInstance', true)
  try {
    await mongo.collection('users').updateMany({}, { $set: { admin: false } })
  } finally {
    await mongo.close()
  }
}
