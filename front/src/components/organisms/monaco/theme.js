/**
 * @import { editor } from 'monaco-editor/editor'
 * @typedef {import('../../molecules/monaco.js').Monaco} Monaco
 */

export const STYLO_THEME = 'stylo'

/**
 * Monaco attend des couleurs hexadécimales : les valeurs reprennent celles de
 * styles/variables.scss.
 */
const palette = {
  background: '#ffffff', // $extra-background-color
  pageBackground: '#f8f9fa', // $main-background-color
  main: '#202020', // $main-color
  lighter: '#4d4d4d', // $main-lighter-color
  muted: '#797676', // $muted-color
  mutedBackground: '#ececec', // $muted-background-color
  links: '#1565c0', // $main-color-links
  highlight: '#fedc2a', // $text-highlight-color
  error: '#cc2b19', // $error-color
  warn: '#faad14', // $warn-color
  info: '#326feb', // $info-color
}

const transparent = '#00000000'

/**
 * Le Markdown est coloré pour du texte, pas pour du code : titres et listes en
 * noir gras, balisage secondaire en gris.
 * @param {string} foreground
 * @param {string[]} tokens
 * @param {string} [fontStyle]
 */
const markdown = (foreground, tokens, fontStyle) =>
  tokens.map((token) => ({
    token: `${token}.md`,
    foreground: foreground.slice(1),
    fontStyle,
  }))

/** @type {editor.IStandaloneThemeData} */
const theme = {
  base: 'vs',
  inherit: true,
  rules: [
    ...markdown(palette.main, ['keyword'], 'bold'),
    ...markdown(palette.links, ['string.link']),
    ...markdown(palette.lighter, ['variable', 'string']),
    ...markdown(palette.muted, [
      'comment',
      'string.target',
      'meta.separator',
      'string.escape',
      'escape',
      'tag',
      'attribute.name.html',
      'string.html',
    ]),
  ],
  colors: {
    // sélection : transparente pour que le texte et le surlignage restent
    // visibles dessous
    'editor.selectionBackground': `${palette.info}33`,
    'editor.inactiveSelectionBackground': `${palette.info}1a`,
    'editor.selectionHighlightBackground': `${palette.info}1a`,
    // correspondances de la recherche, sans bordure
    'editor.findMatchBackground': palette.highlight,
    'editor.findMatchBorder': transparent,
    'editor.findMatchHighlightBackground': palette.mutedBackground,
    'editor.findMatchHighlightBorder': transparent,
    // Monaco surligne toute la ligne de la correspondance courante, soit tout
    // le paragraphe avec wordWrap : le mot recherché n'en ressortait plus
    'editor.rangeHighlightBackground': transparent,
    // mêmes couleurs que les pastilles du validateur dans la marge
    'editorError.foreground': palette.error,
    'editorWarning.foreground': palette.warn,
    'editorInfo.foreground': palette.info,
    // la gouttière se détache du texte, comme le fond des pages de Stylo
    'editorGutter.background': palette.pageBackground,
    'editorLineNumber.foreground': palette.muted,
    'editorLineNumber.activeForeground': palette.main,
    // champ de recherche, suggestions, survols et menus : blanc encadré de noir
    'editorWidget.background': palette.background,
    'editorWidget.foreground': palette.main,
    'editorWidget.border': palette.main,
    'widget.shadow': transparent,
    'menu.background': palette.background,
    'menu.foreground': palette.main,
    'menu.border': palette.main,
  },
}

/** @param {Monaco} monacoInstance */
export function defineStyloTheme(monacoInstance) {
  monacoInstance.editor.defineTheme(STYLO_THEME, theme)
}
