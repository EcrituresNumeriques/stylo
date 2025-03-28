import { BibLatexParser } from 'biblatex-csl-converter'

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

/**
 * @param bibtex
 * @return {Promise<BibTeXParseResult>}
 */
export async function parse(bibtex) {
  const parser = new BibLatexParser(bibtex, {
    processUnexpected: true,
    processUnknown: true,
    includeRawText: true,
    async: true,
  })

  return parser.parse()
}

export function toBibtex(entries) {
  return entries.map((e) => e?.entry?.raw_text ?? e.raw_text).join('\n\n')
}

/**
 * We tolerate `unexpected_field` warnings as it's user provided, it does not have any side effect
 * @see https://github.com/EcrituresNumeriques/stylo/issues/187
 * @param {string} bibtex
 * @returns {Promise<BibTeXValidationResult>}
 */
export async function validate(bibtex) {
  const empty = String(bibtex).trim().length === 0
  if (empty) {
    return {
      empty: true,
      warnings: [],
      errors: [],
      entries: {},
    }
  }
  const result = await parse(bibtex)
  return {
    entries: result.entries,
    empty: false,
    errors: result.errors,
    warnings: result.warnings.filter(
      (error) =>
        error.type !== 'unexpected_field' && error.type !== 'unknown_field'
    ),
  }
}

export function deriveAuthorNameAndDate(entry) {
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
export function toEntries(input) {
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

/**
 * Filter invalid citation from a raw BibTeX
 * @param {string} bibtex
 * @returns {string}
 */
export function filter(bibtex) {
  return bibtex.replace(/^@[a-z]+{noauthor_notitle_nodate\n}/gm, '')
}

const IconNameMap = {
  article: 'journal-article',
  book: 'book',
  booklet: 'journal-article',
  inbook: 'book-section',
  incollection: 'document',
  inproceedings: 'conference-paper',
  manual: 'book',
  mastersthesis: 'thesis',
  misc: 'journal-article',
  phdthesis: 'thesis',
  proceedings: 'book',
  techreport: 'report',
  unpublished: 'manuscript',
}

/**
 * Get the icon name for a given Bibtex type.
 * @param bibtexType
 * @returns {string}
 */
export function iconName(bibtexType) {
  if (bibtexType) {
    const iconName = IconNameMap[bibtexType]
    if (iconName) {
      return iconName
    }
  }
  return 'book'
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
