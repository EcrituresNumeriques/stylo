import { describe, expect, test } from 'vitest'

import { createDelimitedBlockEdit } from './delimited-block.js'

// Minimal selection helper
const sel = (startLineNumber, startColumn, endLineNumber, endColumn) => ({
  startLineNumber,
  startColumn,
  endLineNumber,
  endColumn,
})

describe('createDelimitedBlockEdit()', () => {
  test('minimal block: no selection, no attrs', () => {
    const { text, endCursorState } = createDelimitedBlockEdit({
      selection: sel(1, 1, 1, 1),
      selectionText: '',
      className: 'ack',
      attrs: {},
      contentBefore: '',
      contentAfter: '',
    })
    expect(text).toBe(':::{.ack}\n\n:::\n')
    // no selection → cursor on startLineNumber + 1
    expect(endCursorState).toMatchObject({ startLineNumber: 2, startColumn: 0 })
  })

  test('with selection text: wraps it inside the block', () => {
    const { text, endCursorState } = createDelimitedBlockEdit({
      selection: sel(3, 1, 3, 7),
      selectionText: 'mytext',
      className: 'quote',
      attrs: {},
      contentBefore: '',
      contentAfter: '',
    })
    expect(text).toBe(':::{.quote}\nmytext\n:::\n')
    // 3 newlines in text → cursor at endLineNumber(3) + 3 = 6
    expect(endCursorState).toMatchObject({ startLineNumber: 6, startColumn: 0 })
  })

  test('with attrs: includes them in the delimiter line', () => {
    const { text } = createDelimitedBlockEdit({
      selection: sel(1, 1, 1, 1),
      selectionText: '',
      className: 'notepre',
      attrs: { origin: 'aut' },
      contentBefore: '',
      contentAfter: '',
    })
    expect(text).toBe(':::{.notepre origin="aut"}\n\n:::\n')
  })

  test('with contentBefore only: appears inside the block', () => {
    const { text } = createDelimitedBlockEdit({
      selection: sel(1, 1, 1, 1),
      selectionText: '',
      className: 'epigraph',
      attrs: {},
      contentBefore: '[@source]',
      contentAfter: '',
    })
    expect(text).toBe(':::{.epigraph}\n[@source]\n:::\n')
  })

  test('with contentAfter only: appears inside the block', () => {
    const { text } = createDelimitedBlockEdit({
      selection: sel(1, 1, 1, 1),
      selectionText: '',
      className: 'outline',
      attrs: {},
      contentBefore: '',
      contentAfter: '[[nom]{.name}]{.auth}',
    })
    expect(text).toBe(':::{.outline}\n[[nom]{.name}]{.auth}\n:::\n')
  })

  test('with selection and contentBefore: separated by a blank line', () => {
    const { text } = createDelimitedBlockEdit({
      selection: sel(1, 1, 1, 8),
      selectionText: 'my text',
      className: 'question',
      attrs: {},
      contentBefore: '[speaker]{.speaker}',
      contentAfter: '',
    })
    expect(text).toBe(':::{.question}\n[speaker]{.speaker}\n\nmy text\n:::\n')
  })

  test('with contentBefore and contentAfter: both separated by blank lines', () => {
    const { text } = createDelimitedBlockEdit({
      selection: sel(1, 1, 1, 1),
      selectionText: '',
      className: 'figure',
      attrs: {},
      contentBefore: '[title]{.head}',
      contentAfter: ':::{.credits}\n[@source]\n:::',
    })
    expect(text).toBe(
      ':::{.figure}\n[title]{.head}\n\n:::{.credits}\n[@source]\n:::\n:::\n'
    )
  })

  test('cursor position: selection present → lands after closing delimiter', () => {
    const { endCursorState } = createDelimitedBlockEdit({
      selection: sel(5, 1, 5, 5),
      selectionText: 'text',
      className: 'sig',
      attrs: {},
      contentBefore: '',
      contentAfter: '',
    })
    // text = ':::{.sig}\ntext\n:::\n' → 3 newlines → 5 + 3 = 8
    expect(endCursorState).toMatchObject({ startLineNumber: 8, startColumn: 0 })
  })

  test('with preamble: appears before the opening delimiter', () => {
    const { text } = createDelimitedBlockEdit({
      selection: sel(1, 1, 1, 1),
      selectionText: '',
      className: '',
      attrs: { id: 'refs' },
      preamble: '## Bibliographie',
      contentBefore: '',
      contentAfter: '',
    })
    expect(text).toBe('## Bibliographie\n\n:::{#refs}\n\n:::\n')
  })

  test('with preamble and selection: preamble before delimiter, selection inside', () => {
    const { text } = createDelimitedBlockEdit({
      selection: sel(1, 1, 1, 8),
      selectionText: 'my text',
      className: 'note',
      attrs: {},
      preamble: '## Section',
      contentBefore: '',
      contentAfter: '',
    })
    expect(text).toBe('## Section\n\n:::{.note}\nmy text\n:::\n')
  })

  test('cursor position: no selection → lands on first line inside the block', () => {
    const { endCursorState } = createDelimitedBlockEdit({
      selection: sel(7, 1, 7, 1),
      selectionText: '',
      className: 'dedi',
      attrs: {},
      contentBefore: '',
      contentAfter: '',
    })
    // no selection → startLineNumber + 1 = 8
    expect(endCursorState).toMatchObject({ startLineNumber: 8, startColumn: 0 })
  })
})
