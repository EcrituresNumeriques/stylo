import { onDropIntoEditor } from '../../bibliography/support.js'

/**
 * Uploads the images dropped into the editor, and inserts them.
 * @returns {import('../../../molecules/MonacoEditor.jsx').EditorPlugin}
 */
export default function imageDrop() {
  return {
    setup(editor) {
      const listener = editor.onDropIntoEditor(onDropIntoEditor(editor))
      return () => listener.dispose()
    },
  }
}
