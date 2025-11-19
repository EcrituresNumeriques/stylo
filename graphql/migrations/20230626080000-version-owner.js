exports.up = async function (db) {
  const mongo = db._getDbInstance()
  const articles = mongo.collection('articles')
  const versions = mongo.collection('versions')
  const versionsCursor = versions.find({ owner: null })
  try {
    while (await versionsCursor.hasNext()) {
      const version = await versionsCursor.next()
      const articleId = version.article
      const article = await articles.findOne({ _id: articleId })
      if (article && article.owner !== null) {
        versions.updateOne(
          { _id: version._id },
          {
            $set: {
              owner: article.owner,
            },
          },
          { upsert: false }
        )
      }
    }
  } finally {
    await versionsCursor.close()
  }
}

exports.down = function () {
  return null
}
