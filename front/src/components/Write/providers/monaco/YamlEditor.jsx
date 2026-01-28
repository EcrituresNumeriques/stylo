import * as monaco from 'monaco-editor'
import React, { useMemo } from 'react'

import { loader } from '@monaco-editor/react'

import { MonacoEditor } from '../../../molecules/index.js'
import defaultEditorOptions from './options.js'

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
      height,
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
