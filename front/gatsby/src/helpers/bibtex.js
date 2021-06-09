import { BibLatexParser } from 'biblatex-csl-converter'

export async function parse(bibtex) {
  const parser = new BibLatexParser(bibtex, {
    processUnexpected: true,
    processUnknown: true,
    includeRawText: true,
    async: true,
  })

  // {"entries":{},"errors":[],"warnings":[],"comments":[],"strings":{},"jabref":{"groups":false,"meta":{}}}
  return parser.parse()
}

export function toBibtex(entries) {
  return entries.map((e) => e.raw_text).join('\n\n')
}

/**
 * We tolerate `unexpected_field` warnings as it's user provided, it does not have any side effect
 * @see https://github.com/EcrituresNumeriques/stylo/issues/187
 *
 * @param {string} bibtex
 * @returns {Promise<{success: number,empty: boolean,warnings: Array.<string>,error: Array.<string>}>}
 */
export function validate(bibtex) {
  return parse(bibtex).then((result) => ({
    entries: result.entries,
    success: Object.keys(result.entries).length,
    empty: String(bibtex).trim().length === 0,
    errors: result.errors.map((error) => error.type + ' at line ' + error.line),
    warnings: result.warnings
      .filter(
        (error) =>
          error.type !== 'unexpected_field' && error.type !== 'unknown_field'
      )
      .map((error) => error.type + ' at line ' + error.line),
  }))
}

/**
 * @param {string} Bibtex bibliography
 * @returns {Array.<{ title: string, key: string, type: string }}
 */
export async function toEntries(input) {
  const { entries } = await new BibLatexParser(input, {
    processUnexpected: true,
    processUnknown: true,
    includeRawText: true,
    async: true,
  }).parse()

  return Object.entries(entries)
    .map(([_, entry]) => ({
      title: flatten(entry.fields.title),
      type: entry.bib_type,
      key: entry.entry_key,
      entry,
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
