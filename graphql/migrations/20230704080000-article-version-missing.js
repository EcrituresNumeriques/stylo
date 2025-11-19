exports.up = async function (db) {
  const mongo = db._getDbInstance()
  const articles = mongo.collection('articles')
  const versions = mongo.collection('versions')
  const articlesCursor = articles.find({})
  try {
    while (await articlesCursor.hasNext()) {
      const article = await articlesCursor.next()
      const versionsIds = article.versions
      if (Array.isArray(versionsIds)) {
        for await (const _id of versionsIds) {
          const version = await versions.findOne({ _id })
          if (!version) {
            await articles.updateOne(
              { _id: article._id },
              { $pull: { versions: _id } }
            )
          }
        }
      }
    }
  } finally {
    await articlesCursor.close()
  }
}

exports.down = function () {
  return null
}
