import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import { useSelector, shallowEqual } from 'react-redux'

import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import Editor, { loader } from '@monaco-editor/react'
import { BibliographyCompletionProvider, registerReadOnlyTheme } from './support'

import styles from './TextEditor.module.scss'

self.MonacoEnvironment = {
  getWorker(_, label) {
    return new editorWorker()
  }
}

loader.config({ monaco })

export function MonacoTextEditorForwardRef (props, ref) {
  return React.forwardRef((props, ref) => {

    const handleEditorDidMount = useCallback((editor) => {
      ref.current = editor
    }, [])


    return <Editor
      defaultValue={text}
      className={styles.editor}
      defaultLanguage="markdown"
      onChange={handleEditorChange}
      options={options}
      onMount={handleEditorDidMount}
    />
  })
}


export default function MonacoTextEditor ({ text, readOnly, onTextUpdate }) {
  const articleBibTeXEntries = useSelector(state => state.workingArticle.bibliography.entries, shallowEqual)
  const editorCursorPosition = useSelector(state => state.editorCursorPosition, shallowEqual)
  const editorRef = useRef()
  const bibliographyCompletionProviderRef = useRef(new BibliographyCompletionProvider(articleBibTeXEntries))
  const options = useMemo(() => ({
    automaticLayout: true,
    readOnly: readOnly,
    contextmenu: !readOnly,
    autoClosingBrackets: 'never',
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
  }), [readOnly])

  useEffect(() => {
    const line = editorCursorPosition.lineNumber
    const editor = editorRef.current
    editor?.focus()
    const endOfLineColumn = editor?.getModel()?.getLineMaxColumn(line + 1)
    editor?.setPosition({ lineNumber: line + 1, column: endOfLineColumn })
    editor?.revealLine(line + 1, 1) // smooth
  }, [editorRef, editorCursorPosition])

  useEffect(() => {
    bibliographyCompletionProviderRef.current.bibTeXEntries = articleBibTeXEntries
  }, [articleBibTeXEntries])

  const setTheme = useCallback((monaco) => monaco.editor.setTheme(readOnly ? 'styloReadOnly' : 'vs'), [readOnly])

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    const completionProvider = bibliographyCompletionProviderRef.current.register(monaco)
    registerReadOnlyTheme(monaco)
    setTheme(monaco)
    editor.onDidDispose(() => completionProvider.dispose())
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
