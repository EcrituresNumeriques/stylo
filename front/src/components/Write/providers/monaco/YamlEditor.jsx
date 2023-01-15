import { useMemo } from 'react'
import Editor from '@monaco-editor/react'

import styles from './YamlEditor.module.scss'

export default function MonacoYamlEditor ({ text, onTextUpdate }) {
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
      className={styles.editor}
      defaultValue={text}
      defaultLanguage="yaml"
      onChange={onTextUpdate}
      options={options}
    />
  )
}
