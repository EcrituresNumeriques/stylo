import { useMemo } from 'react'
import * as monaco from 'monaco-editor'
import Editor, { loader } from '@monaco-editor/react'

import styles from './YamlEditor.module.scss'
loader.config({ monaco })

export default function MonacoYamlEditor ({ text, height, onTextUpdate, fontSize = 16 }) {
  const options = useMemo(() => ({
    contextmenu: true,
    wordBasedSuggestions: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    fontSize,
    lineNumbers: false,
    overviewRulerBorder: false,
    renderLineHighlight: false,
    scrollBeyondLastLine: false,
    showFoldingControls: 'always',
    wordWrap: 'off',
    wrappingIndent: 'same',
    minimap: {
      enabled: false
    },
  }), [])

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
