/**
 * Suggests the bibliography keys after `@`.
 * @returns {import('../../../molecules/MonacoEditor.jsx').EditorPlugin}
 */
export default function bibliographyCompletion(provider) {
  return {
    setup(_editor, monaco) {
      const completionProvider = provider.register(monaco)
      return () => completionProvider.dispose()
    },
  }
}
