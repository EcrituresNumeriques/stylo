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
  // la police et la taille de Monaco changent selon le système : Inter, déjà
  // chargée par Stylo, donne le même rendu partout
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  // multiplie fontSize (en dessous de 8), comme les paragraphes de l'aperçu
  lineHeight: 1.6,
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
