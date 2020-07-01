import {BibLatexParser} from 'biblatex-csl-converter'

export async function parse (bibtex, options = { expectOutput: false }) {
    const parser = new BibLatexParser(bibtex, {
        processUnexpected: true,
        processUnknown: true,
        async: true
    })

    // {"entries":{},"errors":[],"warnings":[],"comments":[],"strings":{},"jabref":{"groups":false,"meta":{}}}
    return parser.parse()
}

export function validate(bibtext) {
  return parse(bibtext).then(result => ({
      success: Object.keys(result.entries).length,
      errors: result.errors.map(error => error.type + ' at line ' + error.line),
      warnings: result.warnings.map(error => error.type + ' at line ' + error.line)
  }))
}