import { BibLatexParser } from 'biblatex-csl-converter'

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

/**
 * @param {string} Bibtex bibliography
 * @returns {Array.<{ title: string, key: string, type: string }}
 */
export default (input) => {
  console.log('bib2text')
  const parser = new BibLatexParser(input, {
    processUnexpected: true,
    processUnknown: true,
    includeRawText: true,
    async: false,
  })

  const { entries } = parser.parse()

  return Object.entries(entries)
    .map(([_, entry]) => ({
      title: flatten(entry.fields.title),
      type: entry.bib_type,
      key: entry.entry_key,
      entry,
    }))
    .sort(compare)
}
