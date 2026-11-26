import { onDropIntoEditor } from '../../bibliography/support.js'

/** Uploads and inserts the images dropped into the editor. @returns {import('../../../molecules/MonacoEditor.jsx').EditorPlugin} */
export default function imageDrop() {
  return {
    setup(editor) {
      const listener = editor.onDropIntoEditor(onDropIntoEditor(editor))
      return () => listener.dispose()
    },
  }
}
