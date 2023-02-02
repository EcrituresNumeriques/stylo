import React, { useCallback, useMemo } from 'react'
import * as monaco from 'monaco-editor'
import Editor, { loader } from '@monaco-editor/react'

import styles from '../../../field.module.scss'
loader.config({ monaco })

// Taken from https://github.com/koka-lang/madoko/blob/master/styles/lang/bibtex.json
import languageDefinition from './lang/bibtex.json'

export default React.forwardRef(function MonacoBibtexEditor ({ text, onTextUpdate, height = "300px" }, ref) {
  const options = useMemo(() => ({
    contextmenu: true,
    wordBasedSuggestions: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    fontSize: 16,
    lineNumbers: true,
    overviewRulerBorder: false,
    renderLineHighlight: false,
    scrollBeyondLastLine: false,
    showFoldingControls: 'always',
    wordWrap: 'off',
    wrappingIndent: 'same',
    minimap: {
      enabled: false
    }
  }), [])

  const registerLanguage = useCallback((monaco) => {
    monaco.languages.register({ id: 'bibtex' })
    monaco.languages.setMonarchTokensProvider('bibtex', languageDefinition)
  }, [])

  const handleEditorDidMount = useCallback((monaco) => {
    if (ref) {
      ref.current = monaco
    }
  }, [])

  return (
    <Editor
      height={height}
      defaultValue={text}
      className={styles.textEditor}
      defaultLanguage="bibtex"
      onChange={onTextUpdate}
      options={options}
      beforeMount={registerLanguage}
      onMount={handleEditorDidMount}
    />
  )
})
