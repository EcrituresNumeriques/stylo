import React, { useMemo } from 'react'
import * as monaco from 'monaco-editor'
import Editor, { loader } from '@monaco-editor/react'

import defaultEditorOptions from './options.js'

import styles from './YamlEditor.module.scss'
loader.config({ monaco })

export default function MonacoYamlEditor({
  text,
  height,
  onTextUpdate,
  fontSize = 16,
}) {
  const options = useMemo(
    () => ({
      ...defaultEditorOptions,
      fontSize,
      lineNumbers: false,
      wordWrap: 'off',
      wrappingIndent: 'same',
    }),
    []
  )

  return (
    <Editor
      className={styles.editor}
      height={height}
      defaultValue={text}
      defaultLanguage="yaml"
      onChange={onTextUpdate}
      options={options}
    />
  )
}
