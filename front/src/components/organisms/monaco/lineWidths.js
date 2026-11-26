/**
 * @import { editor } from 'monaco-editor/editor'
 */

/**
 * Largeurs de ligne proposées dans la palette de commandes de l'éditeur, la
 * première par défaut ; `null` revient à la ligne sur toute la largeur.
 * @type {(number|null)[]}
 */
export const lineWidths = [80, 120, null]

/**
 * @param {number|null} [lineWidth]
 * @returns {number|null} la largeur demandée, celle par défaut sinon
 */
export const findLineWidth = (lineWidth) =>
  lineWidths.includes(lineWidth) ? lineWidth : lineWidths[0]

/**
 * Revient à la ligne à `lineWidth` caractères, ou avant si l'éditeur est plus
 * étroit.
 * @param {number|null} lineWidth
 * @returns {editor.IEditorOptions}
 */
export const wordWrapOptions = (lineWidth) =>
  lineWidth
    ? { wordWrap: 'bounded', wordWrapColumn: lineWidth }
    : { wordWrap: 'on' }
