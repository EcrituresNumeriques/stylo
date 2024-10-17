exports.up = async function (db) {
  const mongo = await db._run("getDbInstance", true)
  await mongo
    .collection('users')
    .createIndex({ username: 1 }, { sparse: true, unique: true })

  return mongo.close()
}

exports.down = async function (db) {
  return db.removeIndex('users', 'username_1')
}
