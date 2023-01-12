import { useMemo } from 'react'
import Editor from '@monaco-editor/react'

import styles from '../../../field.module.scss'

export default function MonacoYamlEditor ({ text, onTextUpdate, height = "300px" }) {
  const options = useMemo(() => ({
    contextmenu: true,
    wordBasedSuggestions: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    fontSize: 16,
    lineNumbers: false,
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

  return (
    <Editor
      height={height}
      defaultValue={text}
      className={styles.textEditor}
      defaultLanguage="yaml"
      onChange={onTextUpdate}
      options={options}
    />
  )
}
