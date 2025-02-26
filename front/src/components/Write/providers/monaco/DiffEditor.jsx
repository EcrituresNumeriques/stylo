import React, { useCallback, useEffect, useMemo, useState } from 'react'

import CompareSelect from './CompareSelect'
import styles from './DiffEditor.module.scss'
import * as monaco from 'monaco-editor'
import { DiffEditor, loader } from '@monaco-editor/react'
import { useGraphQLClient } from '../../../../helpers/graphQL'
import { compareVersion as compareVersionQuery } from '../../Write.graphql'
import { defineFlippedDiffTheme } from './support'
loader.config({ monaco })

export default function MonacoDiffEditor({
  text,
  compareTo,
  articleId,
  selectedVersion,
  currentArticleVersion,
  readOnly,
  onTextUpdate,
}) {
  const [modifiedText, setModifiedText] = useState('')
  const { query } = useGraphQLClient()

  const handleEditorDidMount = useCallback((editor, monaco) => {
    defineFlippedDiffTheme(monaco)

    // Set the value once, on load
    // If we use the `original` props, the cursor always goes back to first col/line
    editor.getOriginalEditor().setValue(text)

    if (readOnly === false) {
      // We emulate StandaloneEditor.onUpdate props
      // https://github.com/suren-atoyan/monaco-react/blob/5b9a8e517065af5af2abf9e8e640b23b649b6178/src/Editor/Editor.js#L168-L175
      editor.getOriginalEditor().onDidChangeModelContent(() => {
        onTextUpdate(editor.getOriginalEditor().getValue())
      })
    }
  }, [])

  useEffect(() => {
    query({
      query: compareVersionQuery,
      variables: {
        article: articleId,
        to: compareTo ?? 'working-copy',
        hasVersion: Boolean(compareTo),
      },
    }).then(({ article, version }) =>
      setModifiedText(version?.md ?? article.workingVersion?.md)
    )
  }, [compareTo])

  const monacoOptions = useMemo(
    () => ({
      showFoldingControls: 'always',
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
        enabled: false,
      },
    }),
    [readOnly]
  )

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
