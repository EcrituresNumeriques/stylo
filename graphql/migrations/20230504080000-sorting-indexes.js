exports.up = async function (db) {
  await db.addIndex('articles', 'updatedAt_-1', ['updatedAt'])
  await db.addIndex('tags', 'tags_name-1', ['name'])
  await db.addIndex('tags', 'createdAt_-1', ['createdAt'])
  await db.addIndex('versions', 'createdAt_-1', ['createdAt'])
}

exports.down = async function (db) {
  await db.removeIndex('articles', 'updatedAt_-1')
  await db.removeIndex('tags', 'tags_name-1')
  await db.removeIndex('tags', 'createdAt_-1')
  await db.removeIndex('versions', 'createdAt_-1')
}
