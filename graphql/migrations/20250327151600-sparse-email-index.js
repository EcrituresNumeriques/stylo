exports.up = async function (db) {
  const mongo = await db._run('getDbInstance')

  await db.removeIndex('users', 'email_1')
  await mongo
    .collection('users')
    .createIndex({ email: 1 }, { sparse: true, unique: true })
}

exports.down = async function (db) {
  await db.removeIndex('users', 'email_1')
  await db.createIndex('users', 'email', { unique: true })
}
