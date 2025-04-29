const SPACE_RE = /\s+/gi
const CITATION_RE = /(\[@[\w-]+)/gi
const REMOVE_MARKDOWN_RE = /[#_*]+\s?/gi

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
