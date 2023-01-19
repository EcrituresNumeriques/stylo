/**
 * Returns {count} items of the bibliography
 *
 * @param {String} bibtex
 * @param {Number} count
 * @returns {String}
 */
function previewEntries (bibtex, count = 2) {
  let STATE = ''
  let obj = { kind: '', entry: '' }

  return Array.from((bibtex?.trim() ?? '')
    .split(/^(\s*@(?<kind>[^{]+)\s*\{\s*[\w]+,)\s*$/gm))
    .reduce((all, part) => {
      const trimmedPart = part.trim()

      if (!trimmedPart) {
        return all
      }

      if (trimmedPart.startsWith('@')) {
        STATE = 'HEAD'
        obj = { kind: '', entry: part }
        return all
      }

      if (STATE === 'HEAD') {
        STATE = 'KIND'
        obj.kind = trimmedPart
        return all
      }

      if (STATE === 'KIND') {
        STATE = 'BODY'
        obj.entry += part.trimEnd()
        return all.concat([ [obj.kind, obj.entry ]])
      }
    }, [])
    .sort((a, b) => a[0].localeCompare(b[0]))
    .filter(([kind], index, array) => {
      return array.slice(0, index).some((d) => d[0] === kind) === false
    })
    .slice(0, count)
    .map(([, entry]) => entry)
    .join('\n')
}

module.exports = { previewEntries }
