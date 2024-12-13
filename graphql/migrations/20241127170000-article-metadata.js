const YAML = require('js-yaml')
const { fromLegacyFormat } = require('../helpers/metadata')

exports.up = async function (db) {
  const mongo = await db._run('getDbInstance', true)
  try {
    const articles = mongo.collection('articles')
    const articlesCursor = articles.find({})
    while (await articlesCursor.hasNext()) {
      const article = await articlesCursor.next()
      let metadata = {}
      if (article.workingVersion.yaml) {
        try {
          const [legacyMetadata = {}] = YAML.loadAll(
            article.workingVersion.yaml,
            { json: true }
          )
          metadata = fromLegacyFormat(legacyMetadata)
        } catch (error) {
          console.error(
            `Invalid metadata format on article with id: ${article._id}, metadata will be empty - reason: ${error.reason}`
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
      let metadata = {}
      if (version.yaml) {
        try {
          const [legacyMetadata = {}] = YAML.loadAll(version.yaml, {
            json: true,
          })
          metadata = fromLegacyFormat(legacyMetadata)
        } catch (error) {
          console.error(
            `Invalid metadata format on version with id: ${version._id}, metadata will be empty - reason: ${error.reason}`
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
