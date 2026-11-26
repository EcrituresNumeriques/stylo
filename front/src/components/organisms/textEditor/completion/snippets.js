/**
 * @typedef {object} SnippetItem
 * @property {string} label - Suggested keyword, also used for filtering
 * @property {string} [detail] - Human readable description
 * @property {string} commandId - Monaco command run once the item is accepted
 */

/**
 * Suggests snippets after a prefix typed at the beginning of a line.
 * Accepting an item removes what was typed and runs its command.
 */
export class SnippetCompletionProvider {
  /**
   * @param {object} [options]
   * @param {string} [options.prefix] - Characters which trigger the suggestions
   * @param {SnippetItem[]} [options.items]
   */
  constructor({ prefix = '::', items = [] } = {}) {
    this.prefix = prefix
    this.items = items
  }

  /**
   * @param {monaco} monaco
   * @returns {import('monaco-editor/editor').IDisposable}
   */
  register(monaco) {
    return monaco.languages.registerCompletionItemProvider('markdown', {
      triggerCharacters: [...new Set(this.prefix)],
      provideCompletionItems: (model, position) =>
        this.provideCompletionItems(model, position, monaco),
    })
  }

  /**
   * @param {import('monaco-editor/editor').editor.ITextModel} model
   * @param {import('monaco-editor/editor').Position} position
   * @param {monaco} monaco
   * @returns {{ suggestions: import('monaco-editor/editor').languages.CompletionItem[] }}
   */
  provideCompletionItems(model, position, monaco) {
    const { lineNumber, column } = position
    const typed = model.getValueInRange({
      startLineNumber: lineNumber,
      endLineNumber: lineNumber,
      startColumn: 1,
      endColumn: column,
    })

    if (
      !typed.startsWith(this.prefix) ||
      !/^[\w-]*$/.test(typed.slice(this.prefix.length))
    ) {
      return { suggestions: [] }
    }

    const range = {
      startLineNumber: lineNumber,
      endLineNumber: lineNumber,
      startColumn: 1,
      endColumn: column,
    }

    return {
      suggestions: this.items.map(({ label, detail, commandId }) => ({
        label,
        detail,
        kind: monaco.languages.CompletionItemKind.Snippet,
        filterText: `${this.prefix}${label}`,
        insertText: '',
        range,
        command: { id: commandId, title: detail ?? label },
      })),
    }
  }
}

/**
 * @typedef {import('../../../molecules/monaco.js').Monaco} monaco
 */
