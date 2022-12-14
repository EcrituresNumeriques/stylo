const conn = Mongo()
const session = conn.startSession()

session.startTransaction()

const cursor = db.articles.find({})
while (cursor.hasNext()) {
  const article = cursor.next()
  const latestVersionId = article.versions.slice(-1)[0]
  if (typeof article.workingVersion === 'undefined') {
    if (latestVersionId) {
      const latestVersion = db.versions.findOne({ _id: latestVersionId })
      db.articles.updateOne(
        { _id: article._id },
        {
          $set: {
            workingVersion: {
              bib: latestVersion.bib,
              md: latestVersion.md,
              yaml: latestVersion.yaml,
            },
          },
        },
        { upsert: false }
      )
      // if the latest version is "autosave", remove!
      db.versions.remove({ _id: latestVersionId, autosave: true })
    } else {
      print(`Article ${article._id} has no version and no workingVersion!`)
    }
  } else {
    // article has already a workingVersion, skipping!
  }
}

session.commitTransaction()
