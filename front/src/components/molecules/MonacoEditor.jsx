import Editor, { DiffEditor } from '@monaco-editor/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Loading from './Loading.jsx'
import styles from './MonacoEditor.module.scss'
import { loadMonaco, monaco } from './monaco.js'
import { registerLeaveEditor } from './monacoLeaveEditor.js'

/**
 * Renders `children` once Monaco is loaded, in the interface language.
 * @param {object} props
 * @param {string} [props.className] - also given to the placeholder
 * @param {React.ReactNode} props.children
 */
function WhenMonacoLoaded({ className, children }) {
  const { i18n } = useTranslation('editor', { useSuspense: false })
  const [isLoaded, setIsLoaded] = useState(Boolean(monaco))

  useEffect(() => {
    let isMounted = true
    loadMonaco(i18n.resolvedLanguage).then(() => isMounted && setIsLoaded(true))
    return () => {
      isMounted = false
    }
  }, [])

  if (!isLoaded) {
    return <Loading className={className} />
  }

  return children
}

export default function MonacoEditor({ onMount, ...props }) {
  // sans useSuspense: false, le composant suspend hors de la page d'édition,
  // là où l'espace de noms "editor" n'est pas encore chargé (erreur React #426)
  const { t } = useTranslation('editor', { useSuspense: false })
  const tRef = useRef(t)
  tRef.current = t

  // @monaco-editor/react only calls the onMount it received on the first render
  const handleMount = useCallback(
    (editor, monacoInstance) => {
      registerLeaveEditor(editor, {
        action: () => tRef.current('keyboard.leave.action'),
        hint: () => tRef.current('keyboard.leave.hint'),
        hintClassName: styles.leaveHint,
      })
      onMount?.(editor, monacoInstance)
    },
    [onMount]
  )

  return (
    <WhenMonacoLoaded className={props.className}>
      <Editor {...props} onMount={handleMount} />
    </WhenMonacoLoaded>
  )
}

export function MonacoDiffEditor(props) {
  return (
    <WhenMonacoLoaded className={props.className}>
      <DiffEditor {...props} />
    </WhenMonacoLoaded>
  )
}
