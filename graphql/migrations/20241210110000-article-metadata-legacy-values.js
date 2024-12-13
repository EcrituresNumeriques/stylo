function updateLegacyValues(metadata) {
  if (typeof metadata.publicationDate === 'string') {
    metadata.publicationDate = metadata.publicationDate.replace(/\//g, '-')
  }
  if (typeof metadata.keywords === 'string') {
    metadata.keywords = metadata.keywords.split(',').map((word) => word.trim())
  }
}

exports.up = async function (db) {
  const mongo = await db._run('getDbInstance', true)
  try {
    const articles = mongo.collection('articles')
    const articlesCursor = articles.find({})
    while (await articlesCursor.hasNext()) {
      const article = await articlesCursor.next()
      const metadata = article.workingVersion.metadata
      if (metadata) {
        try {
          updateLegacyValues(metadata)
        } catch (error) {
          console.error(
            `Unable to update legacy values in metadata on article with id: ${article._id} - reason: ${error.reason}`
          )
        }
      }
      await articles.updateOne(
        { _id: article._id },
        {
          $set: {
            'workingVersion.metadata': metadata,
          },
        },
        { upsert: false }
      )
    }
    await articlesCursor.close()
    const versions = mongo.collection('versions')
    const versionsCursor = versions.find({})
    while (await versionsCursor.hasNext()) {
      const version = await versionsCursor.next()
      const metadata = version.metadata
      if (metadata) {
        try {
          updateLegacyValues(metadata)
        } catch (error) {
          console.error(
            `Unable to update legacy values in metadata on version with id: ${version._id} - reason: ${error.reason}`
          )
        }
      }
      await versions.updateOne(
        { _id: version._id },
        {
          $set: {
            metadata,
          },
        },
        { upsert: false }
      )
    }
    await versionsCursor.close()
  } finally {
    mongo.close()
  }
}

exports.down = function () {
  return null
}
