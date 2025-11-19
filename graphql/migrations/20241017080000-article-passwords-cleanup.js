exports.up = async function (db) {
  const mongo = db._getDbInstance()
  const collections = (await mongo.listCollections().toArray()).map(
    (c) => c.name
  )

  // 1. remove article owners (moved into owner+contributors)
  await mongo.collection('articles').updateMany({}, { $unset: { owners: '' } })

  // 2. remove linked collections relations
  await mongo
    .collection('users')
    .updateMany({}, { $unset: { tokens: '', passwords: '' } })

  // 3. remove Password related stuff
  if (collections.includes('passwords')) {
    await mongo.collection('passwords').drop()
  }

  // 4. remove Token related stuff
  if (collections.includes('tokens')) {
    await mongo.collection('tokens').drop()
  }
}

exports.down = function () {
  return null
}
