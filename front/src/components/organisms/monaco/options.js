/**
 * @import { editor } from 'monaco-editor'
 */

/** @type {editor.IEditorOptions|editor.IDiffEditorOptions} */
export default {
  autoClosingBrackets: 'never',
  automaticLayout: true,
  /**
   * Shown with Ctrl+Enter for example
   */
  contextmenu: false,
  hideCursorInOverviewRuler: true,
  lineNumbers: true,
  minimap: {
    enabled: false,
  },
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  renderLineHighlight: false,
  showFoldingControls: 'always',
  scrollBeyondLastLine: false,
  suggest: {
    showWords: false,
  },
  unicodeHighlight: {
    ambiguousCharacters: false,
    invisibleCharacters: true
  },
  wordWrap: 'on',
  wrappingIndent: 'none',
}
