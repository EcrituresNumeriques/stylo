const YAML = require('js-yaml')
const { YAMLException } = require('js-yaml')
const removeMd = require('remove-markdown')
const { logger } = require('../logger')
const config = require('../config.js')

const canonicalBaseUrl = config.get('export.baseUrl')
const FORMATTED_FIELD_RE = /_f$/

/**
 * This sorting ensures the `nocite` key is always the last one.
 * @see https://github.com/EcrituresNumeriques/stylo/issues/425
 */
function sortKeys (a, b) {
  if (a === 'nocite') return 1
  if (b === 'nocite') return -1

  return a.localeCompare(b)
}

function walkObject (obj, itemTransformFn) {
  Object.entries(obj).forEach(([key, value]) => {
    itemTransformFn(obj, key, value)

    if (typeof value === 'object' && value !== null) {
      walkObject(value, itemTransformFn)
    }
  })

  return obj
}

/**
 * Parse a YAML into a useable object
 * It will throw a YAMLException if it fails to parse the string
 *
 * @param {String} yaml
 * @returns {Object}
 */
function toObject (yaml) {
  const [doc = {}] = YAML.loadAll(yaml, 'utf8')

  return doc
}

function reformat (yaml, { id, originalUrl, replaceBibliography = false }) {
  if (!yaml || yaml.trim().length === 0) {
    return ''
  }

  let doc = {}

  try {
    doc = toObject(yaml)
  }
  catch (error) {
    if (error instanceof YAMLException) {
      logger.warn(`Unable to parse Document YAML: ${yaml}. Ignoring`, error)
      return ''
    }
  }

  if (canonicalBaseUrl && originalUrl) {
    // add link-canonical to the first (and only) document
    doc['link-canonical'] = canonicalBaseUrl + originalUrl
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

  // add a default title if missing or empty
  if (!doc.title_f || doc.title_f.trim() === '') {
    doc.title_f = 'untitled'
  }

  walkObject(doc, (node, key, value) => {
    if (key.match(FORMATTED_FIELD_RE)) {
      const unsuffixedKey = key.replace(FORMATTED_FIELD_RE, '')
      const value_type = typeof value

      // we skip the replacement if the cleaned value is manually set
      if (unsuffixedKey in node) {
        return
      }

      if (Array.isArray(value)) {
        /* eslint-disable-next-line security/detect-object-injection */
        node[unsuffixedKey] = value.map(item => removeMd(item))
      } else if (value_type === 'string') {
        /* eslint-disable-next-line security/detect-object-injection */
        node[unsuffixedKey] = removeMd(value)
      } else {
        logger.warn(`node[%s] is of type %s. Cannot undo markdown. Skipping`, key, value_type)
      }
    }
  })

  if (Array.isArray(doc.keywords)) {
    doc.keywords = doc.keywords.map((obj, index) => {
      const { list_f } = obj
      const list_f_type = typeof list_f

      if (Array.isArray(list_f)) {
        obj.list_f = list_f.filter(d => d).map(item => item.trim()).join(', ')
        obj.list = list_f.filter(d => d).map(item => removeMd(item.trim())).join(', ')
      } else if (list_f_type === 'string') {
        obj.list = removeMd(list_f.trim())
      } else {
        logger.warn(`keywords[%d].list_f is of type %s. Cannot undo markdown. Skipping`, index, list_f_type)
      }

      return obj
    })
  }

  // dump the result enclosed in "---"
  return '---\n' + YAML.dump(doc, { sortKeys }) + '---'
}

module.exports = {
  reformat,
  toObject
}
