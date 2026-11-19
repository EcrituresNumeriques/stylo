/**
 * Indexes for the most frequent queries of the application
 * (and the instance usage stats), which scanned whole collections.
 */
const indexes = [
  // articles of a user, sorted by last update (dashboard), and usage stats
  ['articles', { owner: 1, updatedAt: -1, createdAt: 1 }],
  // article of a given version (Version.article)
  ['articles', { versions: 1 }],
  // articles shared with a user
  ['articles', { 'contributors.user': 1 }],
  // articles of a given tag (Tag.articles)
  ['articles', { tags: 1 }],
  // versions of a user
  ['versions', { owner: 1, createdAt: 1 }],
]

exports.up = async function (db) {
  const mongo = db._getDbInstance()
  for (const [collection, keys] of indexes) {
    await mongo.collection(collection).createIndex(keys, { unique: false })
  }
}

exports.down = async function (db) {
  const mongo = db._getDbInstance()
  for (const [collection, keys] of indexes) {
    await mongo.collection(collection).dropIndex(keys)
  }
}
