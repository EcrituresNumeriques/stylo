import { snippetItems } from '../actions/index.js'
import { SnippetCompletionProvider } from '../completion/snippets.js'

/**
 * Suggests the actions of a namespace as snippets, after `::`.
 * @param {object} options
 * @param {import('i18next').TFunction} options.t
 * @param {string} options.namespace - Actions namespace, e.g. `metopes`
 * @param {string[]} options.types - Action types to suggest
 * @returns {import('../../../molecules/MonacoEditor.jsx').EditorPlugin}
 */
export default function snippetCompletionProvider({ t, namespace, types }) {
  return {
    setup(editor, monaco) {
      const items = snippetItems(namespace, editor, t, { types })
      const provider = new SnippetCompletionProvider({ items }).register(monaco)
      return () => provider.dispose()
    },
  }
}
