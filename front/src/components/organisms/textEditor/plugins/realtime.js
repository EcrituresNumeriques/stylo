/**
 * Binds the editor to the shared document, with the others' cursors.
 * @param {{ yText: import('yjs').Text, awareness: import('y-protocols/awareness').Awareness }} options
 * @returns {import('../../../molecules/MonacoEditor.jsx').EditorPlugin}
 */
export default function realtime({ yText, awareness }) {
  return {
    async setup(editor, monaco) {
      const model = editor.getModel()
      // LF everywhere, or Windows and Linux writers desynchronise
      // https://github.com/yjs/y-monaco/issues/27
      model.setEOL(monaco.editor.EndOfLineSequence.LF)

      // y-monaco imports Monaco: it is loaded once Monaco is
      const { MonacoBinding } = await import('y-monaco')
      const binding = new MonacoBinding(
        yText,
        model,
        new Set([editor]),
        awareness
      )
      return () => binding.destroy()
    },
  }
}
