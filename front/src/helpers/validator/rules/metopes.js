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
          messageKey: 'validation.rules.unknownBlockClass',
          messageParams: { class: cls },
          code: 'unknown-block-class',
        })
      }
    }
  })
}

/**
 * @param {import('unist').Node} tree
 * @param {string} _markdown
 * @param {Array} diagnostics
 */
export function singleEpigraphClass(tree, _markdown, diagnostics) {
  let epigraphFound = 0
  visit(tree, 'containerDirective', (node) => {
    const classes = [node.name, ...parseClasses(node.attributes?.class)]
    if (!classes.includes('epigraph')) return
    epigraphFound++
    if (epigraphFound > 1) {
      diagnostics.push({
        line: node.position.start.line,
        column: node.position.start.column,
        endLine: node.position.start.line,
        endColumn: node.position.start.column + 3,
        severity: 'warning',
        messageKey: 'validation.rules.singleEpigraph',
        code: 'single-epigraph-class',
      })
    }
  })
}

const QA_DISALLOWED_ELEMENTS = {
  list: 'list',
  blockquote: 'blockquote',
  table: 'table',
  code: 'code',
  heading: 'heading',
  thematicBreak: 'thematicBreak',
  containerDirective: 'nested',
  leafDirective: 'nested',
}

/**
 * Le contenu des blocs question/answer est limité au texte : pas de listes,
 * citations, tableaux ou autres éléments de bloc.
 *
 * @param {import('unist').Node} tree
 * @param {string} _markdown
 * @param {Array} diagnostics
 */
export function questionAnswerTextOnly(tree, _markdown, diagnostics) {
  visit(tree, 'containerDirective', (node) => {
    if (node.name !== 'question' && node.name !== 'answer') return
    for (const child of node.children || []) {
      // Seuls les paragraphes de texte (y compris le label) sont autorisés.
      if (child.type === 'paragraph') continue
      const element = QA_DISALLOWED_ELEMENTS[child.type] || 'default'
      diagnostics.push({
        line: child.position.start.line,
        column: child.position.start.column,
        endLine: child.position.end.line,
        endColumn: child.position.end.column,
        severity: 'error',
        messageKey: 'validation.rules.questionAnswerTextOnly',
        messageParams: {
          block: node.name,
          element: `validation.rules.elements.${element}`,
        },
        code: 'qa-text-only',
      })
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
            messageKey: 'validation.rules.unknownInlineClass',
            messageParams: { class: cls },
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
        messageKey: 'validation.rules.figureMustContainImage',
        code: 'figure-missing-image',
      })
    }
  })
}

const FIGURE_INLINE_RX = /\[[^\]]*\]\{([^}]*)\}/g
// Lazy alt so it tolerates span syntax hijacked into the légende, e.g.
// `![caption [crédit]{.credits}](url)`.
const FIGURE_IMAGE_RX = /!\[[^\n]*?\]\([^)]*\)/g

/**
 * Returns the free text left on a figure body line once the allowed direct
 * content has been removed: the image (and its légende/alt), and the `head`
 * and `credits` inline spans. Typographic markup nested inside those is kept
 * within them, so it is never reported as free text.
 * @param {string} line
 * @returns {string}
 */
function figureLineFreeText(line) {
  return line
    .replace(FIGURE_IMAGE_RX, ' ')
    .replace(FIGURE_INLINE_RX, (span, attrs) => {
      const classes = parseClasses(attrs)
      return classes.includes('head') || classes.includes('credits')
        ? ' '
        : span
    })
    .trim()
}

/**
 * Whether a figure body line carries an inline `.credits` span. The image is
 * stripped first so that credits hijacked into the légende (alt) do not count.
 * @param {string} line
 * @returns {boolean}
 */
function hasInlineCredits(line) {
  const text = line.replace(FIGURE_IMAGE_RX, ' ')
  let match
  FIGURE_INLINE_RX.lastIndex = 0
  while ((match = FIGURE_INLINE_RX.exec(text)) !== null) {
    if (parseClasses(match[1]).includes('credits')) return true
  }
  return false
}

/**
 * Iterate the body lines of a figure that are not inside a child div.
 * @param {import('../pandoc-divs.js').DivNode} figure
 * @param {string[]} lines
 * @param {(line: string, lineNum: number) => void} fn
 */
function eachFigureDirectLine(figure, lines, fn) {
  const end = figure.endLine ?? lines.length
  const childRanges = figure.children.map((c) => [
    c.startLine,
    c.endLine ?? end,
  ])
  for (let ln = figure.startLine + 1; ln < end; ln++) {
    if (childRanges.some(([s, e]) => ln >= s && ln <= e)) continue
    fn(lines[ln - 1], ln)
  }
}

/**
 * Le contenu direct d'un bloc figure est limité à l'image, au head et aux
 * crédits : aucun texte libre ni autre bloc.
 *
 * @param {import('unist').Node} _tree
 * @param {string} markdown
 * @param {Array} diagnostics
 */
export function figureContentRestricted(_tree, markdown, diagnostics) {
  const lines = markdown.split('\n')
  walkDivs(parsePandocFencedDivs(markdown), (figure) => {
    if (figure.className !== 'figure') return
    for (const child of figure.children) {
      if (child.className === 'credits') continue
      diagnostics.push({
        line: child.startLine,
        column: 1,
        endLine: child.startLine,
        endColumn: 4,
        severity: 'error',
        messageKey: 'validation.rules.figureContentRestrictedBlock',
        messageParams: { class: child.className },
        code: 'figure-content-restricted',
      })
    }
    eachFigureDirectLine(figure, lines, (line, lineNum) => {
      if (figureLineFreeText(line) === '') return
      const column = line.length - line.trimStart().length + 1
      diagnostics.push({
        line: lineNum,
        column,
        endLine: lineNum,
        endColumn: line.length + 1,
        severity: 'error',
        messageKey: 'validation.rules.figureContentRestrictedText',
        code: 'figure-content-restricted',
      })
    })
  })
}

/**
 * Les crédits d'une figure sont autorisés soit en span, soit en div, mais pas
 * les deux simultanément.
 *
 * @param {import('unist').Node} _tree
 * @param {string} markdown
 * @param {Array} diagnostics
 */
export function figureCreditsSpanOrDiv(_tree, markdown, diagnostics) {
  const lines = markdown.split('\n')
  walkDivs(parsePandocFencedDivs(markdown), (figure) => {
    if (figure.className !== 'figure') return
    const hasCreditsDiv = figure.children.some((c) => c.className === 'credits')
    let inlineCreditsLine = null
    eachFigureDirectLine(figure, lines, (line, lineNum) => {
      if (inlineCreditsLine === null && hasInlineCredits(line)) {
        inlineCreditsLine = lineNum
      }
    })
    if (hasCreditsDiv && inlineCreditsLine !== null) {
      diagnostics.push({
        line: inlineCreditsLine,
        column: 1,
        endLine: inlineCreditsLine,
        endColumn: 4,
        severity: 'error',
        messageKey: 'validation.rules.figureCreditsSpanOrDiv',
        code: 'figure-credits-span-and-div',
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
        messageKey: 'validation.rules.prenoteRequiresOrigin',
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
          messageKey: 'validation.rules.translationRequiresLang',
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
          messageKey: 'validation.rules.translationNotNested',
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
          messageKey: 'validation.rules.indexEntryRequiresIdref',
          code: 'index-entry-missing-idref',
        })
      }
    }
  })
}

export const metopesRules = [
  unknownBlockClass,
  unknownInlineClass,
  singleEpigraphClass,
  questionAnswerTextOnly,
  figureMustContainImage,
  figureContentRestricted,
  figureCreditsSpanOrDiv,
  prenoteRequiresOrigin,
  translationRequiresLang,
  translationNotNested,
  indexEntryRequiresIdref,
]
