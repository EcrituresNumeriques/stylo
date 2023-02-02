import React, { useCallback, useEffect, useMemo, useState } from 'react'

import CompareSelect from "./CompareSelect";
import styles from "./DiffEditor.module.scss";
import * as monaco from 'monaco-editor'
import { DiffEditor, loader } from '@monaco-editor/react'
import { useGraphQL } from '../../../../helpers/graphQL'
import { compareVersion as query } from '../../Write.graphql'
import { defineFlippedDiffTheme } from './support'
loader.config({ monaco })

export default function MonacoDiffEditor ({ text, compareTo, articleId, selectedVersion, currentArticleVersion, readOnly, onTextUpdate }) {
  const [modifiedText, setModifiedText] = useState('')
  const runQuery = useGraphQL()

  const handleEditorDidMount = useCallback((editor, monaco) => {
    defineFlippedDiffTheme(monaco)

    // Set the value once, on load
    // If we use the `original` props, the cursor always goes back to first col/line
    editor.getOriginalEditor().setValue(text)

    if (readOnly === false) {
      // We emulate StandaloneDitor.onUpdate props
      // https://github.com/suren-atoyan/monaco-react/blob/5b9a8e517065af5af2abf9e8e640b23b649b6178/src/Editor/Editor.js#L168-L175
      editor.getOriginalEditor().onDidChangeModelContent(() => {
        onTextUpdate(editor.getOriginalEditor().getValue())
      })
    }
  }, [])

  useEffect(() => {
    runQuery({ query, variables: { to: compareTo } })
      .then(({ version }) => setModifiedText(version.md))
  }, [compareTo])

  const monacoOptions = useMemo(() => ({
    showFoldingControls: "always",
    originalEditable: !readOnly,
    readOnly: true,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    scrollBeyondLastLine: false,
    renderIndicators: false,
    wordWrap: 'on',
    wrappingIndent: 'none',
    minimap: {
      enabled: false
    }
  }), [readOnly])

  return (
    <div>
      <CompareSelect
        articleId={articleId}
        selectedVersion={selectedVersion}
        compareTo={compareTo}
        currentArticleVersion={currentArticleVersion}
        readOnly={readOnly}
      />

      <DiffEditor
        className={styles.editor}
        modified={modifiedText}
        language="markdown"
        theme="dark"
        options={monacoOptions}
        onMount={handleEditorDidMount}
      />
    </div>
  )
}
