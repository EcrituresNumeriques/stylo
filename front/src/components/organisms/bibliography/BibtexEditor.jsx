import clsx from 'clsx'
import { useMemo } from 'react'
import fieldStyles from '../../atoms/Field.module.scss'

import { MonacoEditor } from '../../molecules/index.js'
import defaultEditorOptions from '../monaco/options.js'
import styles from './BibtexEditor.module.scss'
import bibtex from './lang/bibtex.js'

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

  return (
    <MonacoEditor
      height={height}
      value={text}
      className={clsx(fieldStyles.textEditor, styles.editor)}
      language={bibtex}
      onChange={onTextUpdate}
      options={options}
      onMount={onMount}
    />
  )
}
