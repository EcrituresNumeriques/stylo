import { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'

import Editor from '@monaco-editor/react'
import { registerBibliographyCompletion } from './support'

import styles from './TextEditor.module.scss'

export default function MonacoTextEditor ({ text, readOnly, onTextUpdate }) {
  const articleBibTeXEntries = useSelector(state => state.workingArticle.bibliography.entries)
  const editorCursorPosition = useSelector(state => state.editorCursorPosition)
  const editorRef = useRef(null)

  useEffect(() => {
    const line = editorCursorPosition.lineNumber
    const editor = editorRef.current
    editor?.focus()
    const endOfLineColumn = editor?.getModel()?.getLineMaxColumn(line + 1)
    editor?.setPosition({lineNumber: line + 1, column: endOfLineColumn})
    editor?.revealLine(line + 1, 1) // smooth
  }, [editorRef, editorCursorPosition])

  function handleEditorDidMount (editor, monaco) {
    editorRef.current = editor
    registerBibliographyCompletion(monaco, articleBibTeXEntries)
  }

  return (
    <Editor
      defaultValue={text}
      height="calc(80vh - 49px)"
      className={styles.editor}
      defaultLanguage="markdown"
      onChange={(value) => {
        onTextUpdate(undefined, undefined, value)
      }}
      options={{
        readOnly: readOnly,
        wordBasedSuggestions: false,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        scrollBeyondLastLine: false,
        minimap: {
          enabled: false
        }
      }}
      onMount={handleEditorDidMount}
    />
  )
}