const conn = Mongo()
const session = conn.startSession()

session.startTransaction()

const cursor = db.versions.find({"owner": null })
while (cursor.hasNext()) {
  const version = cursor.next()
  const articleId = version.article
  const article = db.articles.findOne({_id: articleId})
  if (article !== null && article.owner !== null) {
    db.versions.updateOne(
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

session.commitTransaction()
