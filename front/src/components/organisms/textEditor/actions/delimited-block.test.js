import { describe, expect, test } from 'vitest'

import { Selection } from 'monaco-editor/esm/vs/editor/editor.api'

import { createDelimitedBlockEdit } from './delimited-block.js'

const dummyT = (translationKey) => translationKey

describe('createDelimitedBlockEdit()', () => {
  test('minimal block: no selection, no attrs', () => {
    const { text, endCursorState } = createDelimitedBlockEdit({
      selection: new Selection(1, 1, 1, 1),
      selectionText: '',
      className: 'ack',
      attrs: {},
    })
    expect(text).toBe(':::{.ack}\n\n:::\n')
    expect(endCursorState).toMatchObject({ startLineNumber: 2, startColumn: 1 })
  })

  test('with selection text: wraps it inside the block', () => {
    const { text, endCursorState } = createDelimitedBlockEdit({
      selection: new Selection(3, 1, 3, 7),
      selectionText: 'mytext',
      className: 'quote',
      attrs: {},
    })
    expect(text).toBe(':::{.quote}\nmytext\n:::\n')
    expect(endCursorState).toMatchObject({ startLineNumber: 4, startColumn: 7 })
  })

  test('with attrs: includes them in the delimiter line', () => {
    const { text } = createDelimitedBlockEdit({
      selection: new Selection(1, 1, 1, 1),
      selectionText: '',
      className: 'notepre',
      attrs: { origin: 'aut' },
    })
    expect(text).toBe(':::{.notepre origin="aut"}\n\n:::\n')
  })

  test('with multiple className', () => {
    const { text } = createDelimitedBlockEdit({
      selection: new Selection(1, 1, 1, 1),
      selectionText: '',
      className: 'index, index-type',
      attrs: { origin: () => 'random-text' },
    })
    expect(text).toBe(':::{.index .index-type origin="random-text"}\n\n:::\n')
  })

  test('with contentBefore only: appears inside the block', () => {
    const { text } = createDelimitedBlockEdit({
      selection: new Selection(1, 1, 1, 1),
      selectionText: '',
      className: 'epigraph',
      attrs: {},
      contentBefore: '[@source]\n',
    })
    expect(text).toBe(':::{.epigraph}\n[@source]\n\n:::\n')
  })

  test('with contentAfter only: appears inside the block', () => {
    const { text } = createDelimitedBlockEdit({
      selection: new Selection(1, 1, 1, 1),
      selectionText: '',
      className: 'outline',
      attrs: {},
      contentAfter: '[[nom]{.name}]{.auth}\n',
    })
    expect(text).toBe(':::{.outline}\n[[nom]{.name}]{.auth}\n\n:::\n')
  })

  test('with selection and contentBefore: separated by a blank line', () => {
    const { text } = createDelimitedBlockEdit({
      selection: new Selection(1, 1, 1, 8),
      selectionText: 'my text',
      className: 'question',
      attrs: {},
      contentBefore: '[speaker]{.speaker}\n',
    })
    expect(text).toBe(':::{.question}\n[speaker]{.speaker}\n\nmy text\n:::\n')
  })

  test('with contentBefore and contentAfter: both separated by blank lines', () => {
    const { text } = createDelimitedBlockEdit({
      selection: new Selection(1, 1, 1, 1),
      selectionText: '',
      className: 'figure',
      attrs: {},
      contentBefore: '[title]{.head}\n',
      contentAfter: ':::{.credits}\n[@source]\n:::',
    })
    expect(text).toBe(
      ':::{.figure}\n[title]{.head}\n\n:::{.credits}\n[@source]\n:::\n:::\n'
    )
  })

  test('cursor position: selection present → lands after closing delimiter', () => {
    const { endCursorState } = createDelimitedBlockEdit({
      selection: new Selection(1, 5, 1, 5),
      selectionText: 'text',
      className: 'sig',
      attrs: {},
    })
    // text = ':::{.sig}\ntext\n:::\n' → 3 newlines → 5 + 3 = 8
    expect(endCursorState).toMatchObject({ startLineNumber: 2, startColumn: 5 })
  })

  test('with preamble: appears before the opening delimiter', () => {
    const { text } = createDelimitedBlockEdit(
      {
        selection: new Selection(1, 1, 1, 1),
        selectionText: '',
        className: '',
        attrs: { id: 'refs' },
        preamble: () => '## Bibliographie\n',
      },
      { t: dummyT }
    )
    expect(text).toBe('## Bibliographie\n\n:::{#refs}\n\n:::\n')
  })

  test('with preamble and selection: preamble before delimiter, selection inside', () => {
    const { text } = createDelimitedBlockEdit(
      {
        selection: new Selection(1, 1, 1, 8),
        selectionText: 'my text',
        className: 'note',
        attrs: {},
        preamble: () => '## Section\n',
      },
      { t: dummyT }
    )
    expect(text).toBe('## Section\n\n:::{.note}\nmy text\n:::\n')
  })

  test('with preamble and nothing else (like custom bibliography headline)', () => {
    const { text } = createDelimitedBlockEdit(
      {
        selection: new Selection(1, 1, 1, 1),
        selectionText: '',
        preamble: () => '## Section',
        blockDelimiter: '',
      },
      { t: dummyT }
    )
    expect(text).toBe('## Section\n\n')
  })

  test('cursor position: no selection → lands on first line inside the block', () => {
    const { endCursorState } = createDelimitedBlockEdit({
      selection: new Selection(7, 1, 7, 1),
      selectionText: '',
      className: 'dedi',
      attrs: {},
    })
    // no selection → startLineNumber + 1 = 8
    expect(endCursorState).toMatchObject({ startLineNumber: 8, startColumn: 1 })
  })
})
