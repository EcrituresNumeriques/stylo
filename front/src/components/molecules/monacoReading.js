/**
 * @import { editor } from 'monaco-editor/editor'
 */
import {
  getPreferences,
  setPreference,
  subscribe,
} from '../../helpers/preferences.js'
import { editorFonts, findEditorFont } from '../organisms/monaco/fonts.js'
import {
  findLineWidth,
  lineWidths,
  wordWrapOptions,
} from '../organisms/monaco/lineWidths.js'

/**
 * Applique une préférence de l'éditeur, puis la suit quand elle change.
 * @param {(preferences: object) => string|number|null} read
 * @param {(value: string|number|null) => void} apply appelé à chaque changement
 * @returns {() => void} arrête de suivre la préférence
 */
function follow(read, apply) {
  let current
  const update = () => {
    const value = read(getPreferences('editor'))
    if (value !== current) {
      current = value
      apply(value)
    }
  }
  update()
  return subscribe(update)
}

/**
 * Applique à un éditeur, simple ou de comparaison, la police des préférences.
 * Monaco mesure la police quand on l'applique : il faut la remesurer une fois
 * le fichier chargé, sinon curseurs et sélections sont décalés.
 * @param {editor.IStandaloneCodeEditor|editor.IStandaloneDiffEditor} editor
 * @param {import('./monaco.js').Monaco} api
 * @returns {() => void} arrête de suivre la préférence
 */
export function followEditorFont(editor, api) {
  return follow(
    ({ fontFamily }) => findEditorFont(fontFamily).family,
    (family) => {
      editor.updateOptions({ fontFamily: family })
      document.fonts
        ?.load(`1em ${family}`)
        .then(() => api.editor.remeasureFonts())
    }
  )
}

/**
 * Suit la police et la largeur des lignes des préférences, et propose de les
 * choisir dans la palette de commandes.
 * @param {object} labels - command palette entries
 * @param {(font: string) => string} labels.fontAction
 * @param {(lineWidth: number|null) => string} labels.lineWidthAction
 * @returns {import('./MonacoEditor.jsx').EditorPlugin}
 */
export default function readingPreferences({ fontAction, lineWidthAction }) {
  return {
    /** @param {editor.IStandaloneCodeEditor} editor */
    setup(editor, api) {
      const unfollowFont = followEditorFont(editor, api)
      const unfollowLineWidth = follow(
        ({ lineWidth }) => findLineWidth(lineWidth),
        (lineWidth) => editor.updateOptions(wordWrapOptions(lineWidth))
      )
      const actions = [
        ...editorFonts.map(({ id, label }) =>
          editor.addAction({
            id: `stylo.editorFont.${id}`,
            label: fontAction(label),
            run: () => setPreference('editor', 'fontFamily', id),
          })
        ),
        ...lineWidths.map((lineWidth) =>
          editor.addAction({
            id: `stylo.lineWidth.${lineWidth ?? 'full'}`,
            label: lineWidthAction(lineWidth),
            run: () => setPreference('editor', 'lineWidth', lineWidth),
          })
        ),
      ]

      return () => {
        unfollowFont()
        unfollowLineWidth()
        for (const action of actions) action.dispose()
      }
    },
  }
}
