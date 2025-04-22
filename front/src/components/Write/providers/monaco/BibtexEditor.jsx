import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import React, { useCallback, useMemo } from 'react'
import fieldStyles from '../../../field.module.scss'

// Taken from https://github.com/koka-lang/madoko/blob/master/styles/lang/bibtex.json
import languageDefinition from './lang/bibtex.json'
import defaultEditorOptions from './options.js'
import './BibtexEditor.module.scss'
import MonacoEditor from '../../../molecules/MonacoEditor.jsx'

loader.config({ monaco })

export default function MonacoBibtexEditor({
  text,
  onTextUpdate,
  height = '300px',
  fontSize = 16,
  readOnly = false,
  wordWrap = 'wordWrapColumn',
  wordWrapColumn = 32,
  wrappingIndent = 'indent',
  onMount,
}) {
  const options = useMemo(
    () => ({
      ...defaultEditorOptions,
      hideCursorInOverviewRuler: true,
      lineNumbers: false,
      fontSize,
      readOnly,
      wordWrap,
      wordWrapColumn,
      wrappingIndent,
      glyphMargin: true,
    }),
    [fontSize, readOnly, wordWrap, wordWrapColumn, wrappingIndent]
  )

  const registerLanguage = useCallback((editor) => {
    editor.languages.register({ id: 'bibtex' })
    editor.languages.setMonarchTokensProvider('bibtex', languageDefinition)
  }, [])

  return (
    <MonacoEditor
      height={height}
      defaultValue={text}
      className={fieldStyles.textEditor}
      defaultLanguage="bibtex"
      onChange={onTextUpdate}
      options={options}
      beforeMount={registerLanguage}
      onMount={onMount}
    />
  )
}
