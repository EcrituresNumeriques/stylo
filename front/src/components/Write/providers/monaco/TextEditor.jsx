import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import { useSelector, shallowEqual } from 'react-redux'

import Editor from '@monaco-editor/react'
import { registerBibliographyCompletion, registerReadOnlyTheme } from './support'

import styles from './TextEditor.module.scss'

export default function MonacoTextEditor ({ text, readOnly, onTextUpdate }) {
  const articleBibTeXEntries = useSelector(state => state.workingArticle.bibliography.entries, shallowEqual)
  const editorCursorPosition = useSelector(state => state.editorCursorPosition, shallowEqual)
  const editorRef = useRef(null)
  /* https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IStandaloneEditorConstructionOptions.html */
  const options = useMemo(() => ({
    automaticLayout: true,
    contextmenu: !readOnly,
    hideCursorInOverviewRuler: true,
    // inlayHints: {
    //   enabled: false
    // },
    minimap: {
      enabled: false
    },
    overviewRulerBorder: false,
    overviewRulerLanes: 0,
    readOnly: readOnly,
    scrollBeyondLastLine: false,
    unicodeHighlight: {
      ambiguousCharacters: false,
      invisibleCharacters: true,
    },
    wordBasedSuggestions: false,
    wordWrap: 'on',
    wrappingIndent: 'none'
  }), [readOnly])

  useEffect(() => {
    const line = editorCursorPosition.lineNumber
    const editor = editorRef.current
    editor?.focus()
    const endOfLineColumn = editor?.getModel()?.getLineMaxColumn(line + 1)
    editor?.setPosition({lineNumber: line + 1, column: endOfLineColumn})
    editor?.revealLine(line + 1, 1) // smooth
  }, [editorRef, editorCursorPosition])

  const setTheme = useCallback((monaco) => monaco.editor.setTheme(readOnly ? 'styloReadOnly' : 'vs'), [readOnly])

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    const bibliographyCompletionProvider = registerBibliographyCompletion(monaco, articleBibTeXEntries)
    registerReadOnlyTheme(monaco)
    setTheme(monaco)
    editor.onDidDispose(() => bibliographyCompletionProvider.dispose())
  }, [])

  const handleEditorChange = useCallback((value) => onTextUpdate(value), [])

  return (
    <Editor
      defaultValue={text}
      className={styles.editor}
      defaultLanguage="markdown"
      onChange={handleEditorChange}
      options={options}
      onMount={handleEditorDidMount}
    />
  )
}
