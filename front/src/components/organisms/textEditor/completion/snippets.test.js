import { describe, expect, test, vi } from 'vitest'

import { SnippetCompletionProvider } from './snippets.js'

const monaco = {
  languages: {
    CompletionItemKind: { Snippet: 27 },
    registerCompletionItemProvider: vi.fn(() => ({ dispose() {} })),
  },
}

const items = [
  {
    label: 'ack',
    detail: 'Remerciements',
    commandId: 'editor:ack',
    lineStart: true,
  },
  { label: 'prenote-aut', commandId: 'editor:prenote-aut', lineStart: true },
  { label: 'smallcaps', commandId: 'editor:smallcaps' },
]

/**
 * @param {string} line - Line content, the cursor sits at its end
 */
function complete(line, provider = new SnippetCompletionProvider({ items })) {
  const model = {
    getValueInRange: ({ endColumn }) => line.slice(0, endColumn - 1),
  }
  const position = { lineNumber: 3, column: line.length + 1 }
  return provider.provideCompletionItems(model, position, monaco).suggestions
}

describe('SnippetCompletionProvider', () => {
  test('registers itself for markdown, triggered by the prefix characters', () => {
    new SnippetCompletionProvider({ prefix: '::' }).register(monaco)
    expect(
      monaco.languages.registerCompletionItemProvider
    ).toHaveBeenCalledWith('markdown', {
      triggerCharacters: [':'],
      provideCompletionItems: expect.any(Function),
    })
  })

  test('delegates registered completion to provideCompletionItems', () => {
    const provider = new SnippetCompletionProvider({ items })
    provider.register(monaco)
    const { provideCompletionItems } =
      monaco.languages.registerCompletionItemProvider.mock.lastCall[1]
    const model = { getValueInRange: () => '::' }
    const result = provideCompletionItems(model, { lineNumber: 1, column: 3 })
    expect(result.suggestions).toHaveLength(3)
  })

  test('suggests every item after the prefix at the beginning of a line', () => {
    expect(complete('::')).toEqual([
      {
        label: 'ack',
        detail: 'Remerciements',
        kind: 27,
        filterText: '::ack',
        insertText: '',
        range: {
          startLineNumber: 3,
          endLineNumber: 3,
          startColumn: 1,
          endColumn: 3,
        },
        command: { id: 'editor:ack', title: 'Remerciements' },
      },
      expect.objectContaining({
        label: 'prenote-aut',
        command: { id: 'editor:prenote-aut', title: 'prenote-aut' },
      }),
      expect.objectContaining({ label: 'smallcaps' }),
    ])
  })

  test('keeps suggesting while a keyword is typed', () => {
    const [suggestion] = complete('::prenote-a')
    expect(suggestion.range.endColumn).toBe(12)
  })

  test.each([
    ['a single colon', ':'],
    ['a prefix glued to a word', 'texte::'],
    ['a fenced div delimiter', ':::'],
    ['a keyword followed by a space', '::ack '],
  ])('suggests nothing after %s', (_, line) => {
    expect(complete(line)).toEqual([])
  })

  test('suggests only the inline items in the middle of a line', () => {
    const suggestions = complete('texte ::sm')
    expect(suggestions.map(({ label }) => label)).toEqual(['smallcaps'])
    expect(suggestions[0].range).toMatchObject({
      startColumn: 7,
      endColumn: 11,
    })
  })

  test('suggests nothing without items', () => {
    expect(complete('::', new SnippetCompletionProvider())).toEqual([])
  })
})
