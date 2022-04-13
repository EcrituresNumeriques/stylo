import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import CompareSelect from "./CompareSelect";
import styles from "./DiffEditor.module.scss";
import { DiffEditor } from '@monaco-editor/react'
import askGraphQL from '../../../../helpers/graphQL'
import { defineFlippedDiffTheme } from './support'

export default function MonacoDiffEditor ({ text, compareTo, articleId, selectedVersion, currentArticleVersion, readOnly, onTextUpdate }) {
  const query = `query{ version(version:"${compareTo}"){ _id md } }`
  const [modifiedText, setModifiedText] = useState('')
  const [loading, setLoading] = useState(true)
  const applicationConfig = useSelector(state => state.applicationConfig)
  const monacoRef = useRef(null)

  function handleEditorDidMount (editor, monaco) {
    defineFlippedDiffTheme(monaco)
  }

  useEffect(() => {
    (async () => {
      setLoading(true)
      const data = await askGraphQL(
        { query },
        'fetching version to compareTo',
        null,
        applicationConfig
      )
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