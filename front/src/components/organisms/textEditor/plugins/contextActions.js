import {
  actions,
  MarkdownMenu,
  MetopesMenu,
  registerActions,
  Separator,
} from '../actions/index.js'

/**
 * Stylo actions, in the context menu and the command palette.
 * @param {{ t: import('i18next').TFunction, onSave: () => void }} options
 * @returns {import('../../../molecules/MonacoEditor.jsx').EditorPlugin}
 */
export default function contextActions({ t, onSave }) {
  return {
    setup(editor) {
      const contextMenu = editor.getContribution('editor.contrib.contextmenu')
      const originalMenuActions = contextMenu._getMenuActions(
        editor.getModel(),
        editor.contextMenuId
      )

      contextMenu._getMenuActions = function _getStyloCustomMenuActions() {
        return [
          ...originalMenuActions,
          new Separator(),
          MetopesMenu({ editor, t }),
          MarkdownMenu({ editor, t }),
        ]
      }

      registerActions(editor, t, actions.metopes)
      registerActions(editor, t, actions.markdown)
      registerActions(editor, t, actions.saveShortcut(onSave))
    },
  }
}
