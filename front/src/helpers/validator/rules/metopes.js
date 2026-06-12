import { visit } from 'unist-util-visit'

import { parsePandocFencedDivs, walkDivs } from '../pandoc-divs.js'

const KNOWN_BLOCK_CLASSES = new Set([
  'ack',
  'argument',
  'credits',
  'dedication',
  'epigraph',
  'figure',
  'outline',
  'box',
  'prenote',
  'question',
  'answer',
  'quote-alt',
  'refs',
  'rich-quote',
  'sig',
  'sponsor',
  'translation',
])

const KNOWN_INLINE_CLASSES = new Set([
  'credits',
  'endnote',
  'footnote',
  'index-type',
  'inlinequote',
  'smallcaps',
  'head',
  'speaker',
  'name',
  'surname',
  'aut',
])

/**
 * @param {string} value
 * @returns {string[]}
 */
function parseClasses(value) {
  return (value || '')
    .split(/\s+/)
    .filter((c) => c.startsWith('.'))
    .map((c) => c.slice(1))
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function hasImage(node) {
  let found = false
  visit(node, 'image', () => {
    found = true
  })
  return found
}

/**
 * @param {import('unist').Node} tree
 * @param {string} _markdown
 * @param {Array} diagnostics
 */
export function unknownBlockClass(tree, _markdown, diagnostics) {
  visit(tree, 'containerDirective', (node) => {
    const classes = [node.name, ...parseClasses(node.attributes?.class)]
    for (const cls of classes) {
      if (cls && !KNOWN_BLOCK_CLASSES.has(cls)) {
        diagnostics.push({
          line: node.position.start.line,
          column: node.position.start.column,
          endLine: node.position.start.line,
          endColumn: node.position.start.column + 3,
          severity: 'warning',
          message: `Classe de bloc inconnue : ".${cls}"`,
          code: 'unknown-block-class',
        })
      }
    }
  })
}

/**
 * @param {import('unist').Node} tree
 * @param {string} markdown
 * @param {Array} diagnostics
 */
export function unknownInlineClass(tree, markdown, diagnostics) {
  const lines = markdown.split('\n')
  // Match [text]{.class ...} inline spans
  const spanRx = /\[([^\]]*)\]\{([^}]*)\}/g
  lines.forEach((line, lineIndex) => {
    let match
    while ((match = spanRx.exec(line)) !== null) {
      const attrStr = match[2]
      const classes = attrStr
        .split(/\s+/)
        .filter((t) => t.startsWith('.'))
        .map((t) => t.slice(1))
      for (const cls of classes) {
        if (cls && !KNOWN_INLINE_CLASSES.has(cls)) {
          diagnostics.push({
            line: lineIndex + 1,
            column: match.index + 1,
            endLine: lineIndex + 1,
            endColumn: match.index + match[0].length + 1,
            severity: 'warning',
            message: `Classe inline inconnue : ".${cls}"`,
            code: 'unknown-inline-class',
          })
        }
      }
    }
  })
}

/**
 * @param {import('unist').Node} tree
 * @param {string} _markdown
 * @param {Array} diagnostics
 */
export function figureMustContainImage(tree, _markdown, diagnostics) {
  visit(tree, 'containerDirective', (node) => {
    if (node.name !== 'figure') return
    if (!hasImage(node)) {
      diagnostics.push({
        line: node.position.start.line,
        column: node.position.start.column,
        endLine: node.position.start.line,
        endColumn: node.position.start.column + 3,
        severity: 'error',
        message: 'Un bloc figure doit contenir une image `![caption](url)`',
        code: 'figure-missing-image',
      })
    }
  })
}

/**
 * @param {import('unist').Node} tree
 * @param {string} _markdown
 * @param {Array} diagnostics
 */
export function prenoteRequiresOrigin(tree, _markdown, diagnostics) {
  visit(tree, 'containerDirective', (node) => {
    if (node.name !== 'prenote') return
    if (!node.attributes?.origin) {
      diagnostics.push({
        line: node.position.start.line,
        column: node.position.start.column,
        endLine: node.position.start.line,
        endColumn: node.position.start.column + 3,
        severity: 'error',
        message:
          'Un bloc prenote doit avoir un attribut `origin` (aut, pbl ou tr)',
        code: 'prenote-missing-origin',
      })
    }
  })
}

/**
 * @param {import('unist').Node} _tree
 * @param {string} markdown
 * @param {Array} diagnostics
 */
export function translationRequiresLang(_tree, markdown, diagnostics) {
  const divs = parsePandocFencedDivs(markdown)
  walkDivs(divs, (node) => {
    if (node.className !== 'rich-quote') return
    for (const child of node.children) {
      if (child.className === 'translation' && !child.attrs.lang) {
        diagnostics.push({
          line: child.startLine,
          column: 1,
          endLine: child.startLine,
          endColumn: 4,
          severity: 'error',
          message: 'Un bloc translation doit avoir un attribut `lang`',
          code: 'translation-missing-lang',
        })
      }
    }
  })
}

/**
 * @param {import('unist').Node} _tree
 * @param {string} markdown
 * @param {Array} diagnostics
 */
export function translationNotNested(_tree, markdown, diagnostics) {
  const divs = parsePandocFencedDivs(markdown)
  walkDivs(divs, (node) => {
    if (node.className !== 'translation') return
    for (const child of node.children) {
      if (child.className === 'translation') {
        diagnostics.push({
          line: child.startLine,
          column: 1,
          endLine: child.startLine,
          endColumn: 4,
          severity: 'error',
          message: 'Les blocs translation ne peuvent pas être imbriqués',
          code: 'translation-nesting-invalid',
        })
      }
    }
  })
}

/**
 * @param {import('unist').Node} tree
 * @param {string} markdown
 * @param {Array} diagnostics
 */
export function indexEntryRequiresIdref(tree, markdown, diagnostics) {
  const lines = markdown.split('\n')
  const spanRx = /\[([^\]]*)\]\{([^}]*)\}/g
  lines.forEach((line, lineIndex) => {
    let match
    while ((match = spanRx.exec(line)) !== null) {
      const attrStr = match[2]
      const hasIndexType = attrStr.split(/\s+/).some((t) => t === '.index-type')
      if (hasIndexType && !attrStr.includes('idref=')) {
        diagnostics.push({
          line: lineIndex + 1,
          column: match.index + 1,
          endLine: lineIndex + 1,
          endColumn: match.index + match[0].length + 1,
          severity: 'warning',
          message: "Une entrée d'index doit avoir un attribut `idref`",
          code: 'index-entry-missing-idref',
        })
      }
    }
  })
}

export const metopesRules = [
  unknownBlockClass,
  unknownInlineClass,
  figureMustContainImage,
  prenoteRequiresOrigin,
  translationRequiresLang,
  translationNotNested,
  indexEntryRequiresIdref,
]
