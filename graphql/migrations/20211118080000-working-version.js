exports.up = async function (db) {
  const mongo = await db._run('getDbInstance', true)
  const articles = mongo.collection('articles')
  const versions = mongo.collection('versions')
  const articlesCursor = articles.find({})
  try {
    while (await articlesCursor.hasNext()) {
      const article = await articlesCursor.next()
      if (typeof article.workingVersion === 'undefined') {
        const latestVersionId = article.versions.slice(-1)[0]
        if (latestVersionId) {
          const [latestVersion] = await versions.findOne({ _id: latestVersionId })
          await articles.updateOne({ _id: article._id }, {
              $set: {
                workingVersion: {
                  bib: latestVersion.bib,
                  md: latestVersion.md,
                  yaml: latestVersion.yaml,
                }
              }
            },
            { upsert: false }
          )
          // if the latest version is "autosave", remove!
          await versions.deleteOne({ _id: latestVersionId, autosave: true })
        }
      }
    }
  } finally {
    await articlesCursor.close()
    await mongo.close()
  }
}

exports.down = function () {
  return null
}
