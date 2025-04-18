exports.up = async function (db) {
  const mongo = await db._run('getDbInstance')
  const indexes = await mongo.collection('users').listIndexes().toArray()

  const hasEmailIndex = indexes.some(({ name }) => name === 'email_1')
  if (hasEmailIndex) {
    await mongo.collection('users').dropIndex('email_1')
  }

  await mongo
    .collection('users')
    .createIndex({ email: 1 }, { sparse: true, unique: true })

  return mongo.close()
}

exports.down = async function (db) {
  await db.removeIndex('users', 'email_1')
  await db.addIndex('users', 'email_1', ['email'], true)
}
