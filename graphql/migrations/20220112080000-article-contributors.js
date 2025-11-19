exports.up = async function (db) {
  const mongo = db._getDbInstance()
  const articles = mongo.collection('articles')
  const articlesCursor = articles.find({})
  try {
    while (await articlesCursor.hasNext()) {
      const article = await articlesCursor.next()
      const [ownerId, ...contributors] = article.owners ?? [article.owner]
      await articles.updateOne(
        { _id: article._id },
        {
          $set: {
            owner: ownerId,
            contributors: contributors.map((userId) => ({
              user: userId,
              roles: ['read', 'write'],
            })),
          },
        }
      )
    }
  } finally {
    await articlesCursor.close()
  }
}

exports.down = async function () {
  return null
}
