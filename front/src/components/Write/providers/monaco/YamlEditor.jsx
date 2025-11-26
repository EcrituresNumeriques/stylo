import * as monaco from 'monaco-editor'
import React, { useMemo } from 'react'

import Editor, { loader } from '@monaco-editor/react'

import defaultEditorOptions from './options.js'

import MonacoEditor from '../../../molecules/MonacoEditor.jsx'

import styles from './YamlEditor.module.scss'

loader.config({ monaco })

export default function MonacoYamlEditor({
  text,
  height,
  onTextUpdate,
  fontSize = 16,
  readOnly = false,
}) {
  const options = useMemo(
    () => ({
      ...defaultEditorOptions,
      readOnly,
      fontSize,
      lineNumbers: false,
      wordWrap: 'off',
      wrappingIndent: 'same',
    }),
    [readOnly]
  )

  return (
    <MonacoEditor
      className={styles.editor}
      height={height}
      defaultValue={text}
      defaultLanguage="yaml"
      onChange={onTextUpdate}
      options={options}
    />
  )
}
