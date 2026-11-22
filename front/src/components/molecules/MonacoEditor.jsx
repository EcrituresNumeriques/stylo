import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './MonacoEditor.module.scss'
import { registerLeaveEditor } from './monacoLeaveEditor.js'

// Use monaco-editor as a npm package;
// import it from node_modules and include monaco sources into your bundle (instead of using CDN).
// Reference: https://github.com/suren-atoyan/monaco-react#use-monaco-editor-as-an-npm-package
self.MonacoEnvironment = {
  getWorker() {
    // noinspection JSPotentiallyInvalidConstructorUsage
    return new editorWorker()
  },
}

loader.config({ monaco })
loader.init()

export default function MonacoEditor({ onMount, ...props }) {
  const { t } = useTranslation('editor')
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

  return <Editor {...props} onMount={handleMount} />
}
