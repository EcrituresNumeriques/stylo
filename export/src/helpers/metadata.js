const YAML = require('js-yaml')

const canonicalBaseUrl = process.env.EXPORT_CANONICAL_BASE_URL
const prepare = (yaml, {id, originalUrl, replaceBibliography = false}) => {
  // the YAML contains a single document enclosed in "---" to satisfy pandoc
    // thereby, we need to use "load all":
    const docs = YAML.loadAll(yaml, 'utf8')
    // contains only a single document
    const doc = docs[0]

    if (canonicalBaseUrl && originalUrl) {
      // add link-canonical to the first (and only) document
      doc['link-canonical'] = canonicalBaseUrl + originalUrl
    }

    // add a default title if missing or empty
    const title = doc.title
    if (!title || title.trim().length === 0) {
      doc.title = 'untitled'
    }

    if (replaceBibliography) {
      doc.bibliography = `${id}.bib`
    }

    if (doc.date) {
      const dateString = doc.date.replace(/\//g, '-')
      const [year, month, day] = dateString.split('-')
      doc.date = `${year}/${month}/${day}`
      doc.day = day
      doc.month = month
      doc.year = year
    }

  // dump the result enclosed in "---"
  return '---\n' + YAML.dump(doc, { sortKeys: true }) + '---'
}

module.exports = {
  prepare
}
