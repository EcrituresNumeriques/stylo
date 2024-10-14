exports.up = async function (db) {
  const mongo = await db._run("getDbInstance")
  const cursor = mongo.collection('articles').find({})

  while (await cursor.hasNext()) {
    const article = await cursor.next()
    const latestVersionId = article.versions.slice(-1)[0]

    if (typeof article.workingVersion === 'undefined') {
      if (latestVersionId) {
        const latestVersion = await db.versions.findOne({ _id: latestVersionId })
        await db.articles.updateOne(
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
        await db.versions.remove({ _id: latestVersionId, autosave: true })
      }
    }
  }

  return mongo.close()
}

exports.down = function () {
  return null
}
