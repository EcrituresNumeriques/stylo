import { onDropIntoEditor } from '../../attachments/dropIntoEditor.js'

/**
 * Uploads the images dropped into the editor to the external storage.
 * @param {{ getContext: () => { articleId: string } }} options
 * @returns {import('../../../molecules/MonacoEditor.jsx').EditorPlugin}
 */
export default function imageDrop({ getContext }) {
  return {
    setup(editor) {
      const listener = editor.onDropIntoEditor(
        onDropIntoEditor(editor, getContext)
      )
      return () => listener.dispose()
    },
  }
}
