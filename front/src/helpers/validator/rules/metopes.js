import { visit } from 'unist-util-visit'
import { knownClasses } from '../../../components/organisms/textEditor/actions/index.js'
import { parsePandocFencedDivs, walkDivs } from '../pandoc-divs.js'

const { blocks: KNOWN_BLOCK_CLASSES, inlines: KNOWN_INLINE_CLASSES } =
  knownClasses('metopes')

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

// Lazy alt so it tolerates span syntax hijacked into the légende, e.g.
// `![caption [crédit]{.credits}](url)`.
const FIGURE_IMAGE_RX = /!\[[^\n]*?\]\([^)]*\)/g

/**
 * @typedef {{ start: number, end: number, inner: string, attrs: string }} InlineSpan
 */

/**
 * Parse the top-level `[text]{attrs}` inline spans of a line, matching brackets
 * by depth so a span nested inside another (e.g. a `.credits` span inside a
 * `.head` span) is kept inside its parent rather than splitting it.
 * @param {string} line
 * @returns {InlineSpan[]}
 */
function topLevelSpans(line) {
  const spans = []
  let i = 0
  while (i < line.length) {
    if (line[i] !== '[') {
      i++
      continue
    }
    let depth = 1
    let j = i + 1
    for (; j < line.length && depth > 0; j++) {
      if (line[j] === '[') depth++
      else if (line[j] === ']') depth--
      if (depth === 0) break
    }
    if (depth === 0 && line[j + 1] === '{') {
      const close = line.indexOf('}', j + 2)
      if (close !== -1) {
        spans.push({
          start: i,
          end: close,
          inner: line.slice(i + 1, j),
          attrs: line.slice(j + 2, close),
        })
        i = close + 1
        continue
      }
    }
    i = j + 1
  }
  return spans
}

/**
 * Returns the free text left on a figure body line once the allowed direct
 * content has been removed: the image (and its légende/alt), and the `head`
 * and `credits` inline spans. Markup nested inside those (including a `credits`
 * span within a `head` span) is kept within them, so it is never reported as
 * free text.
 * @param {string} line
 * @returns {string}
 */
function figureLineFreeText(line) {
  let text = line.replace(FIGURE_IMAGE_RX, ' ')
  const spans = topLevelSpans(text)
  for (let k = spans.length - 1; k >= 0; k--) {
    const { start, end, attrs } = spans[k]
    const classes = parseClasses(attrs)
    if (classes.includes('head') || classes.includes('credits')) {
      text = `${text.slice(0, start)} ${text.slice(end + 1)}`
    }
  }
  return text.trim()
}

/**
 * Whether a figure body line carries an inline `.credits` span, at any nesting
 * depth (e.g. inside a `.head` span). The image is stripped first so that
 * credits hijacked into the légende (alt) do not count.
 * @param {string} line
 * @returns {boolean}
 */
function hasInlineCredits(line) {
  const text = line.replace(FIGURE_IMAGE_RX, ' ')
  const stack = topLevelSpans(text)
  while (stack.length > 0) {
    const span = stack.pop()
    if (parseClasses(span.attrs).includes('credits')) return true
    stack.push(...topLevelSpans(span.inner))
  }
  return false
}

/**
 * Iterate the body lines of a div that are not inside a child div.
 * @param {import('../pandoc-divs.js').DivNode} div
 * @param {string[]} lines
 * @param {(line: string, lineNum: number) => void} fn
 */
function eachDirectLine(div, lines, fn) {
  const end = div.endLine ?? lines.length
  const childRanges = div.children.map((c) => [c.startLine, c.endLine ?? end])
  for (let ln = div.startLine + 1; ln < end; ln++) {
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
    eachDirectLine(figure, lines, (line, lineNum) => {
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
    eachDirectLine(figure, lines, (line, lineNum) => {
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
 * `.credits` spans found in a text at any nesting depth, with their offsets.
 * @param {string} text
 * @param {number} [offset]
 * @returns {Array<{ start: number, end: number }>}
 */
function nestedCreditsSpans(text, offset = 0) {
  const found = []
  for (const span of topLevelSpans(text)) {
    if (parseClasses(span.attrs).includes('credits')) {
      found.push({ start: offset + span.start, end: offset + span.end })
    }
    found.push(...nestedCreditsSpans(span.inner, offset + span.start + 1))
  }
  return found
}

/**
 * `.credits` spans of a figure body line, telling where each one stands: in
 * the légende (alt) of the image, nested in another span (e.g. the head), or
 * directly in the figure.
 * @param {string} line
 * @returns {Array<{ start: number, end: number, placement: 'alt'|'nested'|'direct' }>}
 */
function figureLineCredits(line) {
  const credits = []
  for (const image of line.matchAll(FIGURE_IMAGE_RX)) {
    const alt = image[0].slice(2, image[0].indexOf(']('))
    for (const span of nestedCreditsSpans(alt, image.index + 2)) {
      credits.push({ ...span, placement: 'alt' })
    }
  }
  // Blank the images out, keeping the columns
  const text = line.replace(FIGURE_IMAGE_RX, (m) => ' '.repeat(m.length))
  for (const span of topLevelSpans(text)) {
    if (parseClasses(span.attrs).includes('credits')) {
      credits.push({ start: span.start, end: span.end, placement: 'direct' })
    }
    for (const nested of nestedCreditsSpans(span.inner, span.start + 1)) {
      credits.push({ ...nested, placement: 'nested' })
    }
  }
  return credits
}

/**
 * Les crédits d'une figure ne peuvent apparaître qu'une fois. Le cas d'un span
 * et d'un div de crédits est déjà signalé par figureCreditsSpanOrDiv.
 *
 * @param {import('unist').Node} _tree
 * @param {string} markdown
 * @param {Array} diagnostics
 */
export function figureSingleCredits(_tree, markdown, diagnostics) {
  const lines = markdown.split('\n')
  walkDivs(parsePandocFencedDivs(markdown), (figure) => {
    if (figure.className !== 'figure') return
    const divs = figure.children
      .filter((c) => c.className === 'credits')
      .map((c) => ({ line: c.startLine, column: 1, endColumn: 4 }))
    const spans = []
    eachDirectLine(figure, lines, (line, lineNum) => {
      for (const span of figureLineCredits(line)) {
        spans.push({
          line: lineNum,
          column: span.start + 1,
          endColumn: span.end + 2,
          inAlt: span.placement === 'alt',
        })
      }
    })
    const spanAndDivOnly =
      divs.length === 1 && spans.length === 1 && !spans[0].inAlt
    if (divs.length + spans.length < 2 || spanAndDivOnly) return
    const credits = [...divs, ...spans].sort(
      (a, b) => a.line - b.line || a.column - b.column
    )
    for (const { line, column, endColumn } of credits.slice(1)) {
      diagnostics.push({
        line,
        column,
        endLine: line,
        endColumn,
        severity: 'error',
        messageKey: 'validation.rules.figureSingleCredits',
        code: 'figure-single-credits',
      })
    }
  })
}

/**
 * Un span de crédits ne peut figurer que dans l'en-tête (head) ou dans la
 * légende (alt) de l'image, pas directement dans la figure.
 *
 * @param {import('unist').Node} _tree
 * @param {string} markdown
 * @param {Array} diagnostics
 */
export function figureCreditsSpanPlacement(_tree, markdown, diagnostics) {
  const lines = markdown.split('\n')
  walkDivs(parsePandocFencedDivs(markdown), (figure) => {
    if (figure.className !== 'figure') return
    eachDirectLine(figure, lines, (line, lineNum) => {
      for (const span of figureLineCredits(line)) {
        if (span.placement !== 'direct') continue
        diagnostics.push({
          line: lineNum,
          column: span.start + 1,
          endLine: lineNum,
          endColumn: span.end + 2,
          severity: 'error',
          messageKey: 'validation.rules.figureCreditsSpanPlacement',
          code: 'figure-credits-span-placement',
        })
      }
    })
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

/**
 * La hiérarchie des titres doit être cohérente : pas de titre de niveau 1 (le
 * titre de l'article provient des métadonnées), le premier titre est de niveau
 * 2 et les niveaux s'enchaînent sans saut (un `####` ne peut pas suivre un `##`).
 *
 * @param {import('unist').Node} tree
 * @param {string} _markdown
 * @param {Array} diagnostics
 */
export function headingHierarchy(tree, _markdown, diagnostics) {
  // Le titre de l'article (métadonnées) tient lieu de titre de niveau 1.
  let previousLevel = 1
  let first = true
  visit(tree, 'heading', (node) => {
    const level = node.depth
    const position = {
      line: node.position.start.line,
      column: node.position.start.column,
      endLine: node.position.end.line,
      endColumn: node.position.end.column,
      severity: 'error',
    }
    if (level === 1) {
      diagnostics.push({
        ...position,
        messageKey: 'validation.rules.headingLevel1',
        code: 'heading-level-1',
      })
    } else if (level > previousLevel + 1) {
      diagnostics.push(
        first
          ? {
              ...position,
              messageKey: 'validation.rules.headingFirstLevel',
              messageParams: { level },
              code: 'heading-first-level',
            }
          : {
              ...position,
              messageKey: 'validation.rules.headingLevelSkipped',
              messageParams: { level, previous: previousLevel },
              code: 'heading-level-skipped',
            }
      )
    }
    previousLevel = level
    first = false
  })
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isBlank(value) {
  return typeof value !== 'string' || value.trim() === ''
}

/**
 * @param {string} field
 * @param {string} messageKey
 * @param {object} [messageParams]
 * @returns {object}
 */
function metadataDiagnostic(field, messageKey, messageParams) {
  return {
    target: 'metadata',
    field,
    severity: 'warning',
    messageKey,
    ...(messageParams && { messageParams }),
    code: 'metadata-missing',
  }
}

/**
 * Métopes requiert un titre, au moins un auteur avec un nom, une date de
 * publication et une langue. Sans ces métadonnées, la transformation Métopes
 * utilise des valeurs par défaut qui persistent dans toute la chaîne.
 *
 * @param {import('unist').Node} _tree
 * @param {string} _markdown
 * @param {Array} diagnostics
 * @param {{ metadata?: object }} [context]
 */
export function requiredMetadata(_tree, _markdown, diagnostics, context = {}) {
  const metadata = context.metadata ?? {}
  if (isBlank(metadata.title)) {
    diagnostics.push(
      metadataDiagnostic('title', 'validation.rules.metadataMissingTitle')
    )
  }
  const authors = Array.isArray(metadata.authors) ? metadata.authors : []
  if (authors.length === 0) {
    diagnostics.push(
      metadataDiagnostic('authors', 'validation.rules.metadataMissingAuthor')
    )
  } else {
    authors.forEach((author, index) => {
      if (isBlank(author?.surname)) {
        diagnostics.push(
          metadataDiagnostic(
            'authors',
            'validation.rules.metadataMissingAuthorSurname',
            { position: index + 1 }
          )
        )
      }
    })
  }
  if (isBlank(metadata.publicationDate)) {
    diagnostics.push(
      metadataDiagnostic(
        'publicationDate',
        'validation.rules.metadataMissingPublicationDate'
      )
    )
  }
  if (isBlank(metadata.lang)) {
    diagnostics.push(
      metadataDiagnostic('lang', 'validation.rules.metadataMissingLang')
    )
  }
}

export const metopesRules = [
  requiredMetadata,
  unknownBlockClass,
  unknownInlineClass,
  singleEpigraphClass,
  questionAnswerTextOnly,
  figureMustContainImage,
  figureContentRestricted,
  figureCreditsSpanOrDiv,
  figureSingleCredits,
  figureCreditsSpanPlacement,
  prenoteRequiresOrigin,
  translationRequiresLang,
  translationNotNested,
  indexEntryRequiresIdref,
  headingHierarchy,
]
