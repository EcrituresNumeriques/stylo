/**
 * Only gateway to monaco-editor.
 *
 * Monaco computes the labels of its menus and commands when its modules are
 * evaluated: the translation must be set before. Monaco is therefore loaded
 * on demand, after the translation of the interface language.
 *
 * The values below come from Monaco modules that only translate when called:
 * they can be imported at any time.
 */
import { loader } from '@monaco-editor/react'

export {
  Separator,
  SubmenuAction,
} from 'monaco-editor/base/common/actions.js'
export { Range } from 'monaco-editor/editor/common/core/range.js'
export { Selection } from 'monaco-editor/editor/common/core/selection.js'
export { KeyMod } from 'monaco-editor/editor/common/services/editorBaseApi.js'
export {
  KeyCode,
  MarkerSeverity,
  OverlayWidgetPositionPreference,
} from 'monaco-editor/editor/common/standalone/standaloneEnums.js'

/** @type {Record<string, () => Promise<unknown>>} */
const translations = {
  fr: () => import('monaco-editor/nls/lang/fr.js'),
  es: () => import('monaco-editor/nls/lang/es.js'),
}

/**
 * Monaco API, once loaded by `loadMonaco()`
 * @type {import('monaco-editor/editor') | undefined}
 */
export let monaco

let loading

/**
 * Loads Monaco once, translated in `language` (English by default).
 * Changing the language afterwards requires a page reload.
 * @param {string} [language]
 * @returns {Promise<import('monaco-editor/editor')>}
 */
export function loadMonaco(language) {
  loading ??= (async () => {
    await translations[language]?.()

    const [api, { default: EditorWorker }] = await Promise.all([
      import('monaco-editor/editor'),
      import('monaco-editor/editor/editor.worker?worker'),
      import('monaco-editor/features/register.all.js'),
      import('monaco-editor/languages/definitions/markdown/register.js'),
      import('monaco-editor/languages/definitions/yaml/register.js'),
    ])

    self.MonacoEnvironment = { getWorker: () => new EditorWorker() }
    // otherwise @monaco-editor/react loads Monaco from a CDN
    loader.config({ monaco: api })
    monaco = api
    return api
  })()

  return loading
}
