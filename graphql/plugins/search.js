/**
 * Languages known by MongoDB text indexes (ISO 639-1 codes):
 * any other value in the language_override field would make the writes fail.
 */
const TEXT_LANGUAGES = new Set([
  'da',
  'de',
  'en',
  'es',
  'fi',
  'fr',
  'hu',
  'it',
  'nb',
  'nl',
  'pt',
  'ro',
  'ru',
  'sv',
  'tr',
])
/** Language of the documents without a declared language, and of the queries */
const DEFAULT_LANGUAGE = 'fr'
const RESULTS_LIMIT = 20
// score multiplier of the results in the document language
const LANGUAGE_BOOST = 1.5

/**
 * Language a document is stemmed in by the text index (language_override):
 * the declared language when MongoDB knows it, none (no stemming) otherwise.
 * @param {unknown} lang declared language of the document
 * @returns {string}
 */
function searchLanguage(lang) {
  const language = lang || DEFAULT_LANGUAGE
  return TEXT_LANGUAGES.has(language) ? language : 'none'
}

/**
 * Mongoose plugin for the documents of a search_text index (see the
 * migration): keeps searchLanguage up to date and adds a search static.
 * @param {import('mongoose').Schema} schema
 * @param {{ langPath: string }} options path of the declared language
 */
function searchable(schema, { langPath }) {
  schema.add({ searchLanguage: String })

  schema.pre('save', function () {
    this.searchLanguage = searchLanguage(
      this.get(langPath, null, { getters: false })
    )
  })

  /**
   * Text search sorted by score, boosting the documents indexed in the
   * document language.
   * @param {string} query
   * @param {{ filter: object, documentLanguage?: string | null, limit?: number | null }} options
   *   documentLanguage: French when empty; limit: RESULTS_LIMIT when empty
   * @returns {Promise<Record<string, any>[]>} lean documents with a score
   */
  schema.statics.search = function (
    query,
    { filter, documentLanguage, limit }
  ) {
    const language = documentLanguage || DEFAULT_LANGUAGE
    return this.aggregate([
      {
        $match: {
          $and: [{ $text: { $search: query, $language: language } }, filter],
        },
      },
      {
        $addFields: {
          score: {
            $multiply: [
              { $meta: 'textScore' },
              {
                $cond: [
                  { $eq: ['$searchLanguage', language] },
                  LANGUAGE_BOOST,
                  1,
                ],
              },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      { $limit: limit || RESULTS_LIMIT },
    ])
  }
}

module.exports = {
  DEFAULT_LANGUAGE,
  TEXT_LANGUAGES,
  searchLanguage,
  searchable,
}
