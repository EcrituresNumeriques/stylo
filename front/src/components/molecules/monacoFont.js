/**
 * @import { editor } from 'monaco-editor/editor'
 */
import {
  getPreferences,
  setPreference,
  subscribe,
} from '../../helpers/preferences.js'
import { editorFonts, findEditorFont } from '../organisms/monaco/fonts.js'

/**
 * Applique la police choisie dans les préférences, et propose chaque police
 * dans la palette de commandes. Monaco mesure la police quand on l'applique :
 * il faut la remesurer une fois le fichier chargé, sinon curseurs et
 * sélections sont décalés.
 * @param {object} labels
 * @param {(font: string) => string} labels.action - command palette entry
 * @returns {import('./MonacoEditor.jsx').EditorPlugin}
 */
export default function chooseEditorFont({ action }) {
  return {
    /** @param {editor.IStandaloneCodeEditor} editor */
    setup(editor, api) {
      let family
      const applyFont = () => {
        const font = findEditorFont(getPreferences('editor').fontFamily)
        if (font.family === family) {
          return
        }
        family = font.family
        editor.updateOptions({ fontFamily: family })
        document.fonts
          ?.load(`1em ${family}`)
          .then(() => api.editor.remeasureFonts())
      }

      applyFont()
      const unsubscribe = subscribe(applyFont)
      const actions = editorFonts.map(({ id, label }) =>
        editor.addAction({
          id: `stylo.editorFont.${id}`,
          label: action(label),
          run: () => setPreference('editor', 'fontFamily', id),
        })
      )

      return () => {
        unsubscribe()
        for (const actionDisposable of actions) actionDisposable.dispose()
      }
    },
  }
}
