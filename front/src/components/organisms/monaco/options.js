/**
 * @import { editor } from 'monaco-editor/editor'
 */

/** @type {editor.IEditorOptions|editor.IDiffEditorOptions} */
export default {
  autoClosingBrackets: 'never',
  automaticLayout: true,
  /**
   * Shown with Ctrl+Enter for example
   */
  contextmenu: false,
  // Monaco écrit en 12px sur macOS et 14px ailleurs : 15px, soit environ 2pt
  // de plus sur macOS, et la même taille partout
  fontSize: 15,
  hideCursorInOverviewRuler: true,
  lineNumbers: true,
  // Monaco réserve par défaut la largeur de 5 caractères pour les numéros de
  // lignes, ce qui crée un grand espace entre la glyph margin et les numéros.
  lineNumbersMinChars: 3,
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
    invisibleCharacters: true,
  },
  wordWrap: 'on',
  wrappingIndent: 'none',
}
