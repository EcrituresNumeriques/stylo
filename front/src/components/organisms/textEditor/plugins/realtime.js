/**
 * Binds the editor to the shared document, with the cursors of the other
 * writers.
 * @param {object} options
 * @param {import('yjs').Text} options.yText
 * @param {import('y-protocols/awareness').Awareness} options.awareness
 * @returns {import('../../../molecules/MonacoEditor.jsx').EditorPlugin}
 */
export default function realtime({ yText, awareness }) {
  return {
    async setup(editor, monaco) {
      const model = editor.getModel()
      // Set EOL to LF otherwise it causes synchronization issues due to inconsistent EOL between Windows and Linux.
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
