import Editor, { DiffEditor } from '@monaco-editor/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Loading from './Loading.jsx'
import styles from './MonacoEditor.module.scss'
import { languageConfig, loadMonaco, monaco } from './monaco.js'
import { registerLeaveEditor } from './monacoLeaveEditor.js'

/**
 * @typedef {import('monaco-editor/editor').editor.IStandaloneCodeEditor} IStandaloneCodeEditor
 * @typedef {import('./monaco.js').Monaco} Monaco
 * @typedef {import('./monaco.js').LanguageConfig} LanguageConfig
 *
 * Adds something to an editor once it is mounted.
 * @typedef {object} EditorPlugin
 * @property {(editor: IStandaloneCodeEditor, monaco: Monaco) => (void | (() => void) | Promise<void | (() => void)>)} setup
 *   returns an optional cleanup, called when the editor is disposed
 */

/**
 * Sets up each plugin; a failing plugin doesn't prevent the others.
 * @param {IStandaloneCodeEditor} editor
 * @param {Monaco} api
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

/**
 * Loads Monaco and the language once, then returns true.
 * @param {object} options
 * @param {string|LanguageConfig} [options.language]
 * @returns {boolean}
 */
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
 * @param {object} props
 * @param {string|LanguageConfig} props.language - a Monaco language id, or ours
 * @param {EditorPlugin[]} [props.plugins] - set up once, when the editor is mounted
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
      registerLeaveEditor(editor, {
        action: () => tRef.current('keyboard.leave.action'),
        hint: () => tRef.current('keyboard.leave.hint'),
        hintClassName: styles.leaveHint,
      })
      applyPlugins(editor, api, pluginsRef.current)
      onMount?.(editor, api)
    },
    [onMount]
  )

  if (!isLoaded) {
    return <Placeholder {...props} />
  }

  return (
    <Editor
      {...props}
      defaultLanguage={languageConfig(language)?.id}
      onMount={handleMount}
    />
  )
}

/**
 * @param {object} props
 * @param {string|LanguageConfig} props.language
 */
export function MonacoDiffEditor({ language, ...props }) {
  const isLoaded = useMonaco({ language })

  if (!isLoaded) {
    return <Placeholder {...props} />
  }

  return <DiffEditor {...props} language={languageConfig(language)?.id} />
}
