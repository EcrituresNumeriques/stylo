/**
 * @import { editor } from 'monaco-editor/editor'
 * @typedef {import('../../molecules/monaco.js').Monaco} Monaco
 */

export const STYLO_THEME = 'stylo'

/**
 * Monaco attend des couleurs hexadécimales : les valeurs reprennent celles de
 * styles/variables.scss.
 *
 * @type {editor.IStandaloneThemeData}
 */
const theme = {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    // sélection : $info-color, transparent pour que le texte et le surlignage
    // restent visibles dessous
    'editor.selectionBackground': '#326feb59',
    'editor.inactiveSelectionBackground': '#326feb26',
    // correspondance courante : $text-highlight-color, sans bordure
    'editor.findMatchBackground': '#fedc2a',
    'editor.findMatchBorder': '#00000000',
    // autres correspondances : $muted-background-color, sans bordure
    'editor.findMatchHighlightBackground': '#ececec',
    'editor.findMatchHighlightBorder': '#00000000',
    // Monaco surligne toute la ligne de la correspondance courante, soit tout
    // le paragraphe avec wordWrap : le mot recherché n'en ressortait plus
    'editor.rangeHighlightBackground': '#00000000',
  },
}

/** @param {Monaco} monacoInstance */
export function defineStyloTheme(monacoInstance) {
  monacoInstance.editor.defineTheme(STYLO_THEME, theme)
}
