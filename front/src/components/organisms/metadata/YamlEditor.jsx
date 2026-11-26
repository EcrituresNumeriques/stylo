import { useMemo } from 'react'

import { MonacoEditor } from '../../molecules/index.js'
import defaultEditorOptions from '../monaco/options.js'

import styles from './YamlEditor.module.scss'

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
      language="yaml"
      onChange={onTextUpdate}
      options={options}
    />
  )
}
