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
 * @param {string} bibtext
 * @returns {Promise<{success: number,empty: boolean,warnings: Array.<string>,error: Array.<string>}>}
 */
export function validate(bibtext) {
  return parse(bibtext).then(result => ({
      success: Object.keys(result.entries).length,
      empty: String(bibtext).trim().length === 0,
      errors: result.errors.map(error => error.type + ' at line ' + error.line),
      warnings: result.warnings
        .filter(error => error.type !== 'unexpected_field')
        .map(error => error.type + ' at line ' + error.line)
  }))
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
 * @param bibtextType
 * @returns {string}
 */
export function iconName (bibtextType) {
  const iconName = IconNameMap[bibtextType]
  if (iconName) {
    return iconName
  }
  return 'book'
}
