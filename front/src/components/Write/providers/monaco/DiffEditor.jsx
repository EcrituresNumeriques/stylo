import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import CompareSelect from "./CompareSelect";
import styles from "./DiffEditor.module.scss";
import { DiffEditor } from '@monaco-editor/react'
import { useGraphQL } from '../../../../helpers/graphQL'
import { compareVersion as query } from '../../Write.graphql'
import { defineFlippedDiffTheme } from './support'

export default function MonacoDiffEditor ({ text, compareTo, articleId, selectedVersion, currentArticleVersion, readOnly, onTextUpdate }) {
  const [modifiedText, setModifiedText] = useState('')
  const [loading, setLoading] = useState(true)
  const monacoRef = useRef(null)
  const runQuery = useGraphQL()

  function handleEditorDidMount (editor, monaco) {
    defineFlippedDiffTheme(monaco)
  }

  useEffect(() => {
    (async () => {
      setLoading(true)
      const data = await runQuery({ query, variables: { to: compareTo } })
      setModifiedText(data.version.md)
      setLoading(false)
    })()
  }, [compareTo])

  const monacoOptions = {
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
  }

  return (
    <>
      <CompareSelect
        articleId={articleId}
        selectedVersion={selectedVersion}
        compareTo={compareTo}
        currentArticleVersion={currentArticleVersion}
        readOnly={readOnly}
      />
      {loading && '<p>Loading</p>'}
      {!loading && <DiffEditor
        className={styles.editor}
        original={text}
        modified={modifiedText}
        language="markdown"
        theme="dark"
        options={monacoOptions}
        onMount={handleEditorDidMount}
      />
      }
    </>
  )
}
