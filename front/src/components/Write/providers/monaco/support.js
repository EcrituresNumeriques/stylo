export function registerReadOnlyTheme (monaco) {
  monaco.editor.defineTheme('styloReadOnly', {
    base: 'vs',
    inherit: true,
    rules: [{ background: 'EDF9FA' }],
    colors: {
      'editor.foreground': '#000000',
      'editor.background': '#fafafa',
      'editor.lineHighlightBackground': '#fafafa',
      'editorLineNumber.foreground': '#7d7d7d',
      'editor.selectionHighlightBackground': '#fafafa',
      'editorLineNumber.activeForeground': '#7d7d7d',
    }
  })
}

export function registerBibliographyCompletion (monaco, bibTeXEntries) {
  function createBibliographyProposals (range, ctx) {
    const { startsWithSquareBracket, endCharacter } = ctx
    return bibTeXEntries.map((entry) => ({
      label: entry.key,
      kind: monaco.languages.CompletionItemKind.Reference,
      documentation: entry.title,
      insertText: startsWithSquareBracket && endCharacter !== ']' ? `${entry.key}] ` : `${entry.key} `,
      range: range
    }))
  }

  return monaco.languages.registerCompletionItemProvider('markdown', {
    triggerCharacters: '@',
    provideCompletionItems: function (model, position) {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: 1,
        endColumn: position.column
      })
      const match = textUntilPosition.match(/(?:^|\W)(?<square_bracket>\[?)@[^{},~#%\s\\]*$/)
      if (!match) {
        return { suggestions: [] }
      }
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }
      const endCharacter = model.getValueInRange({
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: position.column,
        endColumn: position.column + 1
      })
      const startsWithSquareBracket = match.groups.square_bracket === '['
      return {
        suggestions: createBibliographyProposals(range, { startsWithSquareBracket, endCharacter })
      }
    }
  })
}

export function defineFlippedDiffTheme (monaco) {
  monaco.editor.defineTheme('flippedDiffTheme', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'diffEditor.insertedTextBackground': '#ff000033',
      'diffEditor.removedTextBackground': '#28d22833'
    }
  })
  monaco.editor.setTheme('flippedDiffTheme')
}
