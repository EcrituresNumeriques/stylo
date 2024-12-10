exports.up = async function (db) {
  const mongo = await db._run("getDbInstance", true)
  try {
    await mongo
      .collection('articles')
      .createIndex({ updatedAt: -1 }, { unique: false })
    await mongo
      .collection('tags')
      .createIndex({ name: -1 }, { unique: false })
    await mongo
      .collection('tags')
      .createIndex({ createdAt: -1 }, { unique: false })
    await mongo
      .collection('articles')
      .createIndex({ createdAt: -1 }, { unique: false })
    await mongo
      .collection('versions')
      .createIndex({ createdAt: -1 }, { unique: false })
  } finally {
    await mongo.close()
  }
}

exports.down = async function (db) {
  await db.removeIndex('articles', 'updatedAt_-1')
  await db.removeIndex('tags', 'name_-1')
  await db.removeIndex('tags', 'createdAt_-1')
  await db.removeIndex('versions', 'createdAt_-1')
}
