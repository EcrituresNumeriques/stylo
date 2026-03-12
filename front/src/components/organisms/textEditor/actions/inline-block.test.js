import { describe, expect, test } from 'vitest'

import {
  createEnclosingTextFormattingEdit,
  createEnclosingTextStyleEdit,
  createHyperlinkEdit,
  createInlineFootnoteEdit,
} from './inline-block.js'

// Minimal selection helper
const sel = (startLineNumber, startColumn, endLineNumber, endColumn) => ({
  startLineNumber,
  startColumn,
  endLineNumber,
  endColumn,
})

describe('createEnclosingTextFormattingEdit()', () => {
  test('wraps selection with bold marks', () => {
    const { text, endCursorState } = createEnclosingTextFormattingEdit({
      selection: sel(1, 1, 1, 5),
      selectionText: 'test',
      formattingMark: '**',
    })
    expect(text).toBe('**test**')
    // cursor placed after closing mark: startColumn(1) + text.length(8) = 9
    expect(endCursorState).toMatchObject({ startLineNumber: 1, startColumn: 9 })
  })

  test('wraps selection with italic mark', () => {
    const { text, endCursorState } = createEnclosingTextFormattingEdit({
      selection: sel(1, 1, 1, 5),
      selectionText: 'text',
      formattingMark: '_',
    })
    expect(text).toBe('_text_')
    expect(endCursorState).toMatchObject({ startLineNumber: 1, startColumn: 7 })
  })

  test('toggles off when selection already has marks', () => {
    const { text, endCursorState } = createEnclosingTextFormattingEdit({
      selection: sel(1, 1, 1, 9),
      selectionText: '**test**',
      formattingMark: '**',
    })
    expect(text).toBe('test')
    // cursor collapses to startColumn
    expect(endCursorState).toMatchObject({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1,
    })
  })

  test('empty selection: inserts empty marks and places cursor between them', () => {
    const { text, endCursorState } = createEnclosingTextFormattingEdit({
      selection: sel(1, 3, 1, 3),
      selectionText: '',
      formattingMark: '**',
    })
    expect(text).toBe('****')
    // cursor at startColumn(3) + markLength(2) = 5
    expect(endCursorState).toMatchObject({ startColumn: 5 })
  })

  test('multiline selection: cursor placed on last line', () => {
    const { text, endCursorState } = createEnclosingTextFormattingEdit({
      selection: sel(1, 1, 3, 7),
      selectionText: 'first\nsecond',
      formattingMark: '**',
    })
    expect(text).toBe('**first\nsecond**')
    // last line "second" length(6) + markLength(2) = 8
    expect(endCursorState).toMatchObject({ startLineNumber: 3, startColumn: 8 })
  })
})

describe('createEnclosingTextStyleEdit()', () => {
  test('wraps selection in a Pandoc CSS-class span', () => {
    const { text, endCursorState } = createEnclosingTextStyleEdit({
      selection: sel(1, 1, 1, 9),
      selectionText: 'citation',
      styleName: 'inlinequote',
    })
    expect(text).toBe('[citation]{.inlinequote}')
    // endColumn(9) + styleAttr.length("{.inlinequote}"=14) + 2 brackets = 25
    expect(endCursorState).toMatchObject({ startColumn: 25 })
  })

  test('empty selection: cursor placed inside brackets', () => {
    const { text, endCursorState } = createEnclosingTextStyleEdit({
      selection: sel(1, 5, 1, 5),
      selectionText: '',
      styleName: 'smallcaps',
    })
    expect(text).toBe('[]{.smallcaps}')
    // startColumn(5) + 1 = 6 (inside the brackets)
    expect(endCursorState).toMatchObject({ startColumn: 6 })
  })

  test('uses styleName, not id, for the class attribute', () => {
    const { text } = createEnclosingTextStyleEdit({
      selection: sel(1, 1, 1, 5),
      selectionText: 'word',
      styleName: 'notepre',
    })
    expect(text).toBe('[word]{.notepre}')
  })
})

describe('createInlineFootnoteEdit()', () => {
  test('appends ^[] after selection and places cursor inside brackets', () => {
    const { text, endCursorState } = createInlineFootnoteEdit({
      selection: sel(2, 1, 2, 5),
      selectionText: 'text',
    })
    expect(text).toBe('text^[]')
    // endColumn(5) + 2 = 7
    expect(endCursorState).toMatchObject({ startLineNumber: 2, startColumn: 7 })
  })

  test('empty selection: produces ^[] with cursor inside', () => {
    const { text, endCursorState } = createInlineFootnoteEdit({
      selection: sel(1, 3, 1, 3),
      selectionText: '',
    })
    expect(text).toBe('^[]')
    expect(endCursorState).toMatchObject({ startColumn: 5 })
  })
})

describe('createHyperlinkEdit()', () => {
  const cases = [
    {
      name: 'nothing/nothing → placeholder URL',
      clipboardText: '',
      selectionText: '',
      expectedText: '[](https://example.com)',
    },
    {
      name: 'clipboard text / no selection → clipboard becomes label',
      clipboardText: 'clip',
      selectionText: '',
      expectedText: '[clip](https://example.com)',
    },
    {
      name: 'selection text / no clipboard → selection becomes label',
      clipboardText: '',
      selectionText: 'text',
      expectedText: '[text](https://example.com)',
    },
    {
      name: 'both texts → selection wins as label',
      clipboardText: 'clip',
      selectionText: 'text',
      expectedText: '[text](https://example.com)',
    },
    {
      name: 'clipboard URL / no selection → clipboard becomes href',
      clipboardText: 'https://clipboard.local',
      selectionText: '',
      expectedText: '[](https://clipboard.local)',
    },
    {
      name: 'selection URL / no clipboard → selection becomes href',
      clipboardText: '',
      selectionText: 'https://selection.local',
      expectedText: '[](https://selection.local)',
    },
    {
      name: 'clipboard text / selection URL → selection is href, clipboard is label',
      clipboardText: 'clip',
      selectionText: 'https://selection.local',
      expectedText: '[clip](https://selection.local)',
    },
    {
      name: 'clipboard URL / selection text → clipboard is href, selection is label',
      clipboardText: 'https://clipboard.local',
      selectionText: 'text',
      expectedText: '[text](https://clipboard.local)',
    },
  ]

  test.each(cases)(
    '$name',
    ({ clipboardText, selectionText, expectedText }) => {
      const { text } = createHyperlinkEdit({
        selection: sel(1, 1, 1, selectionText.length + 1),
        clipboardText,
        selectionText,
      })
      expect(text).toBe(expectedText)
    }
  )

  test('multiline label: cursor placed at end of last line', () => {
    const { endCursorState } = createHyperlinkEdit({
      selection: sel(1, 1, 2, 7),
      clipboardText: '',
      selectionText: 'first\nsecond',
    })
    // last line "second" length(6) + 1 (opening bracket) = 7
    expect(endCursorState).toMatchObject({ startColumn: 7 })
  })
})
