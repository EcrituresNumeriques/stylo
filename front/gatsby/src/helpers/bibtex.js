import {BibLatexParser, BibLatexExporter} from 'biblatex-csl-converter'

export async function parse (bibtex, options = { expectOutput: false }) {
    const parser = new BibLatexParser(bibtex, {
        processUnexpected: true,
        processUnknown: true,
        async: true
    })

    // {"entries":{},"errors":[],"warnings":[],"comments":[],"strings":{},"jabref":{"groups":false,"meta":{}}}
    return parser.parse()
}

export function toBibtex (entries) {
  const bibDB = entries.reduce((db, entry, i) => {
    return Object.assign(db, { [String(i)]: entry })
  }, {})

  return (new BibLatexExporter(bibDB, false, {exportUnexpectedFields: true})).parse()
}

/**
 * We tolerate `unexpected_field` warnings as it's user provided, it does not have any side effect
 * @see https://github.com/EcrituresNumeriques/stylo/issues/187
 *
 * @param {string} bibtex
 * @returns {Promise<{success: number,empty: boolean,warnings: Array.<string>,error: Array.<string>}>}
 */
export function validate(bibtex) {
  return parse(bibtex).then(result => ({
      success: Object.keys(result.entries).length,
      empty: String(bibtex).trim().length === 0,
      errors: result.errors.map(error => error.type + ' at line ' + error.line),
      warnings: result.warnings
        .filter(error => error.type !== 'unexpected_field' && error.type !== 'unknown_field')
        .map(error => error.type + ' at line ' + error.line)
  }))
}

/**
 * Filter invalid citation from a raw BibTeX
 * @param {string} bibtex
 * @returns {string}
 */
export function filter(bibtex) {
  return bibtex.replace(/^@[a-z]+{noauthor_notitle_nodate\n}/gm, "")
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
  unpublished: 'manuscript'
}

/**
 * Get the icon name for a given Bibtex type.
 * @param bibtexType
 * @returns {string}
 */
export function iconName (bibtexType) {
  if (bibtexType) {
    const iconName = IconNameMap[bibtexType]
    if (iconName) {
      return iconName
    }
  }
  return 'book'
}
