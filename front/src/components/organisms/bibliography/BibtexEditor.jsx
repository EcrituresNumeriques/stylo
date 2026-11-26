import clsx from 'clsx'
import { useCallback, useMemo } from 'react'
import fieldStyles from '../../atoms/Field.module.scss'

import { MonacoEditor } from '../../molecules/index.js'
import defaultEditorOptions from '../monaco/options.js'
import styles from './BibtexEditor.module.scss'

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

  const registerLanguage = useCallback((monaco) => {
    monaco.languages.register({ id: 'bibtex' })
    // loaded on demand, like Monaco languages
    // Taken from https://github.com/koka-lang/madoko/blob/master/styles/lang/bibtex.json
    monaco.languages.setMonarchTokensProvider(
      'bibtex',
      import('./lang/bibtex.json').then((module) => module.default)
    )
  }, [])

  return (
    <MonacoEditor
      height={height}
      value={text}
      className={clsx(fieldStyles.textEditor, styles.editor)}
      defaultLanguage="bibtex"
      onChange={onTextUpdate}
      options={options}
      beforeMount={registerLanguage}
      onMount={onMount}
    />
  )
}
