import Editor, { DiffEditor } from '@monaco-editor/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { STYLO_THEME } from '../organisms/monaco/theme.js'
import Loading from './Loading.jsx'
import styles from './MonacoEditor.module.scss'
import { languageConfig, loadMonaco, monaco } from './monaco.js'
import chooseEditorFont from './monacoFont.js'
import leaveEditor from './monacoLeaveEditor.js'

/**
 * @typedef {import('monaco-editor/editor').editor.IStandaloneCodeEditor} IStandaloneCodeEditor
 * @typedef {import('./monaco.js').LanguageConfig} LanguageConfig
 * Adds something to a mounted editor, and returns an optional cleanup.
 * @typedef {{ setup: (editor: IStandaloneCodeEditor, monaco: import('./monaco.js').Monaco) => unknown }} EditorPlugin
 */

/**
 * Sets up each plugin; a failing plugin doesn't prevent the others.
 * @param {IStandaloneCodeEditor} editor
 * @param {import('./monaco.js').Monaco} api
 * @param {EditorPlugin[]} plugins
 */
export function applyPlugins(editor, api, plugins) {
  const cleanups = []
  let isDisposed = false

  editor.onDidDispose(() => {
    isDisposed = true
    for (const cleanup of cleanups) cleanup()
  })

  for (const plugin of plugins) {
    Promise.resolve()
      .then(() => plugin.setup(editor, api))
      .then((cleanup) => {
        if (typeof cleanup !== 'function') return
        // an asynchronous setup can end after the editor is gone
        if (isDisposed) cleanup()
        else cleanups.push(cleanup)
      })
      .catch((error) => console.error('Monaco plugin setup failed', error))
  }
}

/**
 * Takes the place of the editor while Monaco loads: same wrapper as the one
 * of @monaco-editor/react, so that the page doesn't move.
 */
function Placeholder({ className, width = '100%', height = '100%' }) {
  return (
    <section style={{ display: 'flex', position: 'relative', width, height }}>
      <div className={className} style={{ width: '100%' }}>
        <Loading />
      </div>
    </section>
  )
}

/** @returns {boolean} true once Monaco and the language are loaded */
function useMonaco({ language }) {
  const { i18n } = useTranslation('editor', { useSuspense: false })
  const [isLoaded, setIsLoaded] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: once, like the plugins: the language is the one of the mount
  useEffect(() => {
    let isMounted = true
    loadMonaco({ locale: i18n.resolvedLanguage, language }).then(
      () => isMounted && setIsLoaded(true)
    )
    return () => {
      isMounted = false
    }
  }, [])

  return isLoaded && Boolean(monaco)
}

/**
 * @param {{ language: string|LanguageConfig, plugins?: EditorPlugin[] }} props
 *   the plugins are set up once, when the editor is mounted
 */
export default function MonacoEditor({
  language,
  plugins = [],
  onMount,
  ...props
}) {
  // sans useSuspense: false, le composant suspend hors de la page d'édition,
  // là où l'espace de noms "editor" n'est pas encore chargé (erreur React #426)
  const { t } = useTranslation('editor', { useSuspense: false })
  const tRef = useRef(t)
  tRef.current = t
  const pluginsRef = useRef(plugins)
  pluginsRef.current = plugins

  const isLoaded = useMonaco({ language })

  // @monaco-editor/react only calls the onMount it received on the first render
  const handleMount = useCallback(
    (editor, api) => {
      applyPlugins(editor, api, [
        // keyboard users can always leave the editor
        leaveEditor({
          action: () => tRef.current('keyboard.leave.action'),
          hint: () => tRef.current('keyboard.leave.hint'),
          hintClassName: styles.leaveHint,
        }),
        chooseEditorFont({
          action: (font) => tRef.current('font.action', { font }),
        }),
        ...pluginsRef.current,
      ])
      onMount?.(editor, api)
    },
    [onMount]
  )

  if (!isLoaded) {
    return <Placeholder {...props} />
  }

  return (
    <Editor
      theme={STYLO_THEME}
      {...props}
      defaultLanguage={languageConfig(language)?.id}
      onMount={handleMount}
    />
  )
}

/** @param {{ language: string|LanguageConfig }} props */
export function MonacoDiffEditor({ language, ...props }) {
  const isLoaded = useMonaco({ language })

  if (!isLoaded) {
    return <Placeholder {...props} />
  }

  // le thème Monaco est global : sans lui, le thème par défaut de DiffEditor
  // s'appliquerait aussi aux autres éditeurs
  return (
    <DiffEditor
      theme={STYLO_THEME}
      {...props}
      language={languageConfig(language)?.id}
    />
  )
}
