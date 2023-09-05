const conn = Mongo()
const session = conn.startSession()

session.startTransaction()

const cursor = db.articles.find()
while (cursor.hasNext()) {
  const article = cursor.next()
  const versions = article.versions
  if (versions && versions.length > 0) {
    for (const version of versions) {
      const versionFound = db.versions.findOne({_id: version})
      if (versionFound && versionFound._id) {
        // continue
      } else {
        db.articles.updateOne(
          { _id: article._id },
          { $pull: { versions: version } }
        )
      }
    }
  }
}

session.commitTransaction()
