/**
 * Only gateway to monaco-editor. Monaco translates its menus when its modules
 * are evaluated: it is loaded on demand, after the translation.
 * The values exported below only translate when called.
 */
import { loader } from '@monaco-editor/react'

import { defineStyloTheme } from '../organisms/monaco/theme.js'

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
 * @typedef {{ id: string, load: (monaco: Monaco) => unknown }} LanguageConfig
 */

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

/** @type {Monaco | undefined} set by `loadMonaco()` */
export let monaco

const loaded = new Map()
const once = (key, load) => {
  if (!loaded.has(key)) loaded.set(key, load())
  return loaded.get(key)
}

async function loadCore(locale) {
  await translations[locale]?.()

  let EditorWorker
  ;[monaco, { default: EditorWorker }] = await Promise.all([
    import('monaco-editor/editor'),
    import('monaco-editor/editor/editor.worker?worker'),
    import('monaco-editor/features/register.all.js'),
  ])

  self.MonacoEnvironment = { getWorker: () => new EditorWorker() }
  // otherwise @monaco-editor/react loads Monaco from a CDN
  loader.config({ monaco })
  defineStyloTheme(monaco)

  return monaco
}

/**
 * @param {string|LanguageConfig} [language] - a Monaco language id, or ours
 * @returns {LanguageConfig|undefined}
 */
export function languageConfig(language) {
  return typeof language === 'string' ? languages[language] : language
}

/**
 * Loads Monaco, then the language, once each. The translation is the one of
 * the first call: changing it requires a page reload.
 * @param {{ locale?: string, language?: string|LanguageConfig }} [options]
 * @returns {Promise<Monaco>}
 */
export async function loadMonaco({ locale, language } = {}) {
  await once('core', () => loadCore(locale))
  const config = languageConfig(language)
  if (config) {
    await once(`language:${config.id}`, async () => config.load(monaco))
  }
  return monaco
}
