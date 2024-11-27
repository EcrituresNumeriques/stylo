const YAML = require('js-yaml')
const { fromLegacyFormat } = require('../helpers/metadata')

exports.up = async function (db) {
  const articles = await db._find('articles', {})
  for await (const article of articles) {
    let metadata = {}
    if (article.workingVersion.yaml) {
      try {
        const [legacyMetadata = {}] = YAML.loadAll(article.workingVersion.yaml, 'utf8')
        metadata = fromLegacyFormat(legacyMetadata)
      } catch (error) {
        console.error(`Invalid metadata format on article with id: ${article._id}, metadata will be empty - reason: ${error.reason}`)
      }
    }
    await db._run('update', 'articles', {
      query: { _id: article._id },
      update: {
        $set: {
          "workingVersion.metadata": metadata
        }
      },
      options: { upsert: false }
    })
  }

  const versions = await db._find('versions', {})
  for await (const version of versions) {
    let metadata = {}
    if (version.yaml) {
      try {
        const [legacyMetadata = {}] = YAML.loadAll(version.yaml, 'utf8')
        metadata = fromLegacyFormat(legacyMetadata)
      } catch (error) {
        console.error(`Invalid metadata format on version with id: ${version._id}, metadata will be empty - reason: ${error.reason}`)
      }
    }
    await db._run('update', 'versions', {
      query: { _id: version._id },
      update: {
        $set: {
          metadata
        }
      },
      options: { upsert: false }
    })
  }
}

exports.down = function () {
  return null
}
