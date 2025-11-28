exports.up = async function (db) {
  const mongo = db._getDbInstance()
  const indexes = await mongo.collection('users').listIndexes().toArray()

  const hasEmailIndex = indexes.some(({ name }) => name === 'email_1')
  if (hasEmailIndex) {
    await mongo.collection('users').dropIndex('email_1')
  }

  await mongo
    .collection('users')
    .createIndex({ email: 1 }, { sparse: true, unique: true })
}

exports.down = async function (db) {
  const mongo = db._getDbInstance()
  await mongo.collection('users').dropIndex('email_1')
  await mongo.collection('users').createIndex({ email: 1 }, { unique: true })
}
