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

/**
 * @typedef {import('monaco-editor/editor')} Monaco
 * @typedef {object} LanguageConfig
 * @property {string} id
 * @property {(monaco: Monaco) => unknown} load - registers the language
 */

/** @type {Record<string, () => Promise<unknown>>} */
const translations = {
  fr: () => import('monaco-editor/nls/lang/fr.js'),
  es: () => import('monaco-editor/nls/lang/es.js'),
}

/** @type {Record<string, LanguageConfig>} */
const languages = {
  markdown: {
    id: 'markdown',
    load: () =>
      import('monaco-editor/languages/definitions/markdown/register.js'),
  },
  yaml: {
    id: 'yaml',
    load: () => import('monaco-editor/languages/definitions/yaml/register.js'),
  },
}

/**
 * Monaco API, once loaded by `loadMonaco()`
 * @type {Monaco | undefined}
 */
export let monaco

/** @type {Map<string, Promise<unknown>>} */
const loaded = new Map()

/**
 * @param {string} key
 * @param {() => Promise<unknown>} load
 */
function once(key, load) {
  if (!loaded.has(key)) {
    loaded.set(key, load())
  }
  return loaded.get(key)
}

/**
 * @param {string} [locale]
 * @returns {Promise<Monaco>}
 */
async function loadCore(locale) {
  await translations[locale]?.()

  const [api, { default: EditorWorker }] = await Promise.all([
    import('monaco-editor/editor'),
    import('monaco-editor/editor/editor.worker?worker'),
    // splitting the features would only save ~90 KB gzip, for many chunks
    import('monaco-editor/features/register.all.js'),
  ])

  self.MonacoEnvironment = { getWorker: () => new EditorWorker() }
  // otherwise @monaco-editor/react loads Monaco from a CDN
  loader.config({ monaco: api })
  monaco = api
  return api
}

/**
 * @param {string|LanguageConfig} [language] - a Monaco language id, or ours
 * @returns {LanguageConfig|undefined}
 */
export function languageConfig(language) {
  return typeof language === 'string' ? languages[language] : language
}

/**
 * Loads Monaco, then a language: each of them only once.
 * The translation (`locale`, English by default) is the one of the first
 * call: changing it requires a page reload.
 * @param {object} [options]
 * @param {string} [options.locale]
 * @param {string|LanguageConfig} [options.language]
 * @returns {Promise<Monaco>}
 */
export async function loadMonaco({ locale, language } = {}) {
  const api = await once('core', () => loadCore(locale))
  const config = languageConfig(language)

  if (config) {
    await once(`language:${config.id}`, async () => config.load(api))
  }

  return api
}
