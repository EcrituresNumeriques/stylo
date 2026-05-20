import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import { metopesRules } from './rules/metopes.js'

/**
 * Converts pandoc-style fenced divs `:::{.class}` to remark-directive format `:::class{.class}`
 * so that remark-directive can parse them correctly.
 * @param {string} markdown
 * @returns {string}
 */
function preprocessPandocDivs(markdown) {
  return markdown.replace(/^(:::+)\{([^}]*)\}/gm, (_, colons, attrs) => {
    const classMatch = attrs.match(/\.([a-zA-Z0-9_-]+)/)
    const name = classMatch ? classMatch[1] : 'div'
    return `${colons}${name}{${attrs}}`
  })
}

/**
 * @param {Array<(tree: object, markdown: string, diagnostics: Array) => void>} rules
 * @returns {(markdown: string) => Promise<Array>}
 */
export function createValidator(rules) {
  const processor = unified().use(remarkParse).use(remarkDirective)

  return async function validate(markdown) {
    const preprocessed = preprocessPandocDivs(markdown)
    const tree = processor.parse(preprocessed)
    const diagnostics = []
    for (const rule of rules) {
      rule(tree, markdown, diagnostics)
    }
    return diagnostics.sort((a, b) => a.line - b.line || a.column - b.column)
  }
}

export const VALIDATORS = {
  metopes: createValidator(metopesRules),
}

/** @type {Array<{id: string, labelKey: string}>} */
export const VALIDATOR_PROFILE_DEFS = [
  { id: 'metopes', labelKey: 'validation.profile.metopes' },
]
