const SPACE_RE = /\s+/gi
const CITATION_RE = /(\[@[\w-]+)/gi
const REMOVE_MARKDOWN_RE = /[#_*]+\s?/gi
const TITLE_RE = /^(##+)\s(.*)/

export function computeTextStats(md) {
  const text = (md || '').trim()

  const textWithoutMarkdown = text.replace(REMOVE_MARKDOWN_RE, '')
  const wordCount = textWithoutMarkdown
    .replace(SPACE_RE, ' ')
    .split(' ')
    .filter((e) => e !== '').length

  const charCountNoSpace = textWithoutMarkdown.replace(SPACE_RE, '').length
  const charCountPlusSpace = textWithoutMarkdown.length
  const citationNb = text.match(CITATION_RE)?.length || 0

  return {
    wordCount,
    charCountNoSpace,
    charCountPlusSpace,
    citationNb,
  }
}

export function computeTextStructure(md) {
  const text = (md || '').trim()
  return text
    .split('\n')
    .map((line, index) => ({ line, index }))
    .filter((lineWithIndex) => lineWithIndex.line.match(TITLE_RE))
    .map((lineWithIndex) => {
      const result = TITLE_RE.exec(lineWithIndex.line)
      const level = result[1].length - 1
      const title = result[2]
      return { ...lineWithIndex, title, level }
    })
}
