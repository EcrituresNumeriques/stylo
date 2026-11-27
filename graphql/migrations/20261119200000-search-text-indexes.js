// Text indexes used by the search query (MongoDB $text).

const { DEFAULT_LANGUAGE, TEXT_LANGUAGES } = require('../plugins/search.js')

// weight of each metadata field (content: 1)
const METADATA_WEIGHTS = {
  title: 5,
  'localizedContent.title': 5,
  keywords: 5,
  'localizedContent.keywords': 5,
  'controlledKeywords.label': 5,
  subtitle: 5,
  'localizedContent.subtitle': 5,
  'authors.forename': 5,
  'authors.surname': 5,
  'translators.forename': 5,
  'translators.surname': 5,
  'directors.forename': 5,
  'directors.surname': 5,
  abstract: 3,
  'localizedContent.abstract': 3,
  'journal.name': 3,
  name: 3,
  'issue.title': 3,
  id: 1,
  'isbns.isbn': 1,
}

/**
 * Computed field read by the text index (language_override):
 * the declared language when MongoDB knows it, none otherwise.
 * @param {string} langPath path of the declared language
 */
const assignSearchLanguage = (langPath) => [
  {
    $set: {
      searchLanguage: {
        $switch: {
          branches: [
            {
              case: { $in: [{ $ifNull: [langPath, null] }, [null, '']] },
              then: DEFAULT_LANGUAGE,
            },
            { case: { $in: [langPath, [...TEXT_LANGUAGES]] }, then: langPath },
          ],
          default: 'none',
        },
      },
    },
  },
]

function createTextIndex(collection, fields, metadataPrefix) {
  const weights = { ...fields }
  for (const [path, weight] of Object.entries(METADATA_WEIGHTS)) {
    weights[`${metadataPrefix}.${path}`] = weight
  }
  const keys = Object.fromEntries(
    Object.keys(weights).map((path) => [path, 'text'])
  )
  return collection.createIndex(keys, {
    name: 'search_text',
    weights,
    default_language: DEFAULT_LANGUAGE,
    language_override: 'searchLanguage',
  })
}

exports.up = async function (db) {
  if (db.internals.dryRun) return
  const mongo = db._getDbInstance()
  const articles = mongo.collection('articles')
  const corpus = mongo.collection('corpus')

  await articles.updateMany(
    {},
    assignSearchLanguage('$workingVersion.metadata.lang')
  )
  await corpus.updateMany({}, assignSearchLanguage('$metadata.lang'))

  await createTextIndex(
    articles,
    { title: 5, 'workingVersion.md': 1 },
    'workingVersion.metadata'
  )
  await createTextIndex(corpus, { name: 5, description: 3 }, 'metadata')
}

exports.down = async function (db) {
  if (db.internals.dryRun) return
  await db.removeIndex('articles', 'search_text')
  await db.removeIndex('corpus', 'search_text')
  const mongo = db._getDbInstance()
  await mongo
    .collection('articles')
    .updateMany({}, { $unset: { searchLanguage: '' } })
  await mongo
    .collection('corpus')
    .updateMany({}, { $unset: { searchLanguage: '' } })
}
