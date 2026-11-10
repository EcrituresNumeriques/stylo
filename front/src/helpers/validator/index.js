import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

import { parseOpeningFence } from './pandoc-divs.js'
import { metopesRules } from './rules/metopes.js'

/**
 * Converts pandoc-style fenced divs (`:::{.class}`, `::: {.class}` or
 * `::: class`) to remark-directive format `:::class{.class}` so that
 * remark-directive can parse them correctly.
 * @param {string} markdown
 * @returns {string}
 */
export function preprocessPandocDivs(markdown) {
  return markdown
    .split('\n')
    .map((line) => {
      const fence = parseOpeningFence(line)
      if (!fence) return line
      const classMatch = fence.attrs.match(/\.([a-zA-Z0-9_-]+)/)
      const name = classMatch ? classMatch[1] : 'div'
      return `${fence.colons}${name}{${fence.attrs}}`
    })
    .join('\n')
}

export const processor = unified().use(remarkParse).use(remarkDirective)

/**
 * Diagnostics on metadata (without a line) come first, then by position in the text.
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
export function compareDiagnostics(a, b) {
  return (a.line ?? 0) - (b.line ?? 0) || (a.column ?? 0) - (b.column ?? 0)
}

/**
 * @typedef {{ metadata?: object }} ValidationContext
 */

/**
 * @param {Array<(tree: object, markdown: string, diagnostics: Array, context: ValidationContext) => void>} rules
 * @returns {(markdown: string, context?: ValidationContext) => Promise<Array>}
 */
export function createValidator(rules) {
  return async function validate(markdown, context = {}) {
    const preprocessed = preprocessPandocDivs(markdown)
    const tree = processor.parse(preprocessed)
    const diagnostics = []
    for (const rule of rules) {
      rule(tree, markdown, diagnostics, context)
    }
    return diagnostics.sort(compareDiagnostics)
  }
}

export const VALIDATORS = {
  metopes: createValidator(metopesRules),
}

/** @type {Array<{id: string, labelKey: string}>} */
export const VALIDATOR_PROFILE_DEFS = [
  { id: 'metopes', labelKey: 'validation.profile.metopes' },
]
