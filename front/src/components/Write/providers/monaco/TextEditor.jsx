import { useCallback, useEffect, useRef } from 'react'
import { shallowEqual, useSelector } from 'react-redux'

import Editor from '@monaco-editor/react'
import { registerBibliographyCompletion } from './support'

import styles from './TextEditor.module.scss'

export default function MonacoTextEditor ({ text, readOnly, onTextUpdate }) {
  const articleBibTeXEntries = useSelector(state => state.workingArticle.bibliography.entries, shallowEqual)
  const editorCursorPosition = useSelector(state => state.editorCursorPosition, shallowEqual)
  const editorRef = useRef(null)

  useEffect(() => {
    const line = editorCursorPosition.lineNumber
    const editor = editorRef.current
    editor?.focus()
    const endOfLineColumn = editor?.getModel()?.getLineMaxColumn(line + 1)
    editor?.setPosition({lineNumber: line + 1, column: endOfLineColumn})
    editor?.revealRangeAtTop({ startLineNumber: line + 1, endLineNumber: line + 1, endColumn: endOfLineColumn, startColumn: endOfLineColumn }, 1) // smooth
  }, [editorRef, editorCursorPosition])

  function handleEditorDidMount (editor, monaco) {
    editorRef.current = editor
    const bibliographyCompletionProvider = registerBibliographyCompletion(monaco, articleBibTeXEntries)
    editor.onDidDispose(() => bibliographyCompletionProvider.dispose())
  }

  const handleEditorChange = useCallback((value) => onTextUpdate(undefined, undefined, value), [])
  return (
    <Editor
      defaultValue={text}
      className={styles.editor}
      defaultLanguage="markdown"
      onChange={handleEditorChange}
      options={{
        readOnly: readOnly,
        wordBasedSuggestions: false,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        wrappingIndent: 'none',
        minimap: {
          enabled: false
        }
      }}
      onMount={handleEditorDidMount}
    />
  )
}