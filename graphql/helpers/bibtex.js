const BibLatexParser = require('biblatex-csl-converter').BibLatexParser

/**
 * @typedef BibTeXParseResult
 * @type {object}
 * @property {{[key: string]: {}}} entries
 * @property {{[key: string]: {}}} strings
 * @property {{groups: *, meta: *}} jabref
 * @property {{type: string, line: number, entry: string|undefined, key: string|undefined, expected: string|undefined, found: string|undefined}[]} errors
 * @property {{type: string, line: number, type_name: string|undefined}[]} warnings
 * @property {{type: string, line: number}[]} comments
 */

/**
 * @typedef BibTeXValidationResult
 * @type {object}
 * @property {{[key: string]: {}}} entries
 * @property {boolean} empty
 * @property {{type: string, line: number, entry: string|undefined, key: string|undefined, expected: string|undefined, found: string|undefined}[]} errors
 * @property {{type: string, line: number, type_name: string|undefined}[]} warnings
 */

function deriveAuthorNameAndDate(entry) {
  const author = entry.fields?.author
  const date = entry.fields?.date
  let authorName = ''

  if (Array.isArray(author) && author.length) {
    const { family, given, prefix, literal } = author[0]
    if (literal) {
      authorName = literal.map((o) => o.text).join(' ')
    } else {
      const authorPrefix = prefix
        ? `${prefix.map((o) => o.text).join(' ')} `
        : ''
      const authorNames = []
      if (given) {
        authorNames.push(given.map((o) => o.text).join(' '))
      }
      if (family) {
        authorNames.push(family.map((o) => o.text).join(' '))
      }
      authorName = `${authorPrefix}${authorNames.join(', ')}`
    }
  }

  return { date, authorName }
}

/**
 * @param {string} input bibliography as BibTeX
 * @returns {{ title: string, key: string, type: string }[]}
 */
function toEntries(input) {
  if (input === '') {
    return []
  }
  const { entries } = new BibLatexParser(input, {
    processUnexpected: true,
    processUnknown: true,
    includeRawText: true,
    async: false,
  }).parse()

  return Object.entries(entries)
    .map(([, entry]) => ({
      title: flatten(entry.fields.title),
      type: entry.bib_type,
      key: entry.entry_key,
      entry,
      ...deriveAuthorNameAndDate(entry),
    }))
    .sort(compare)
}

const compare = (a, b) => {
  if (a.key < b.key) return -1
  if (a.key > b.key) return 1
  return 0
}

const flatten = (entryTitle) => {
  if (entryTitle) {
    return entryTitle.map(({ text }) => text).join('')
  }
  return ''
}

module.exports = { toEntries }
