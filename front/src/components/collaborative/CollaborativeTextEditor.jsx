import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { Helmet } from 'react-helmet'
import throttle from 'lodash.throttle'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { MonacoBinding } from 'y-monaco'

import { useArticleVersion, useEditableArticle } from '../../hooks/article.js'
import { useStyloExportPreview } from '../../hooks/stylo-export.js'
import { useBibliographyCompletion } from '../../hooks/bibliography.js'
import { useCollaboration } from '../../hooks/collaboration.js'

import CollaborativeEditorWebSocketStatus from './CollaborativeEditorWebSocketStatus.jsx'
import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'
import defaultEditorOptions from '../Write/providers/monaco/options.js'

import styles from './CollaborativeTextEditor.module.scss'
import MonacoEditor from '../molecules/MonacoEditor.jsx'
import { DiffEditor } from '@monaco-editor/react'
import * as vscode from 'monaco-editor'
import { onDropIntoEditor } from '../Write/providers/monaco/support.js'

/**
 * @param {object} props
 * @param {string} props.articleId
 * @param {string|undefined} props.versionId
 * @param {'write' | 'compare' | 'preview'} props.mode
 * @returns {Element}
 */
export default function CollaborativeTextEditor({
  articleId,
  versionId,
  mode,
}) {
  const { yText, awareness, websocketStatus, dynamicStyles } = useCollaboration(
    { articleId, versionId }
  )

  const { version, error, isLoading: isVersionLoading } = useArticleVersion({ versionId })
  const { provider: bibliographyCompletionProvider } =
    useBibliographyCompletion()
  const { article, bibliography, isLoading: isWorkingVersionLoading } = useEditableArticle({
    articleId,
    versionId,
  })

  const { html: __html, isLoading: isPreviewLoading } = useStyloExportPreview({
    ...(mode === 'preview'
      ? {
          md_content: versionId ? version.md : yText?.toString(),
          yaml_content: versionId
            ? version.yaml
            : article?.workingVersion?.yaml,
          bib_content: versionId ? version.bib : article?.workingVersion?.bib,
        }
      : {}),
    with_toc: true,
    with_nocite: true,
    with_link_citations: true,
  })

  const dispatch = useDispatch()
  const editorRef = useRef(null)
  const editorCursorPosition = useSelector(
    (state) => state.editorCursorPosition,
    shallowEqual
  )

  const hasVersion = useMemo(() => !!versionId, [versionId])
  const isLoading = yText === null || isPreviewLoading || isWorkingVersionLoading || isVersionLoading

  const options = useMemo(
    () => ({
      ...defaultEditorOptions,
      contextmenu: hasVersion ? false : websocketStatus === 'connected',
      readOnly: hasVersion ? true : websocketStatus !== 'connected',
      dropIntoEditor: {
        enabled: true,
      },
    }),
    [websocketStatus, hasVersion]
  )

  const handleUpdateArticleStructureAndStats = throttle(
    ({ text }) => {
      dispatch({ type: 'UPDATE_ARTICLE_STATS', md: text })
      dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md: text })
    },
    250,
    { leading: false, trailing: true }
  )

  const handleCollaborativeEditorDidMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor
      editor.onDropIntoEditor(onDropIntoEditor(editor))
      const completionProvider = bibliographyCompletionProvider.register(monaco)
      editor.onDidDispose(() => completionProvider.dispose())
      const model = editor.getModel()
      // Set EOL to LF otherwise it causes synchronization issues due to inconsistent EOL between Windows and Linux.
      // https://github.com/yjs/y-monaco/issues/27
      model.setEOL(monaco.editor.EndOfLineSequence.LF)
      if (yText && awareness) {
        new MonacoBinding(yText, model, new Set([editor]), awareness)
      }
    },
    [yText, awareness]
  )

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor
  }, [])

  let timeoutId
  useEffect(() => {
    if (yText) {
      yText.observe(function (yTextEvent, transaction) {
        dispatch({
          type: 'UPDATE_ARTICLE_WORKING_COPY_STATUS',
          status: 'syncing',
        })
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
          dispatch({
            type: 'UPDATE_ARTICLE_WORKING_COPY_STATUS',
            status: 'synced',
          })
        }, 4000)

        handleUpdateArticleStructureAndStats({ text: yText.toString() })
      })
    }
  }, [yText])

  useEffect(() => {
    if (version) {
      dispatch({ type: 'UPDATE_ARTICLE_STATS', md: version.md })
      dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md: version.md })
    }
  }, [version])

  useEffect(() => {
    if (bibliography) {
      bibliographyCompletionProvider.bibTeXEntries = bibliography.entries
    }
  }, [bibliography])

  useEffect(() => {
    const line = editorCursorPosition.lineNumber
    const editor = editorRef.current
    editor?.focus()
    const endOfLineColumn = editor?.getModel()?.getLineMaxColumn(line + 1)
    editor?.setPosition({ lineNumber: line + 1, column: endOfLineColumn })
    editor?.revealLineNearTop(line + 1, 1) // smooth
  }, [editorRef, editorCursorPosition])

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <Alert message={error.message} />
  }

  return (
    <>
      <style>{dynamicStyles}</style>
      <Helmet>
        <title>{article.title}</title>
      </Helmet>

      <CollaborativeEditorWebSocketStatus
        className={styles.inlineStatus}
        status={websocketStatus}
      />

      {mode === 'preview' && (
        <section
          className={styles.previewPage}
          dangerouslySetInnerHTML={{ __html }}
        />
      )}

      {mode === 'compare' && (
        <div className={styles.collaborativeEditor}>
          <DiffEditor
            className={styles.editor}
            width={'100%'}
            height={'auto'}
            modified={article.workingVersion?.md}
            original={version.md}
            language="markdown"
            options={defaultEditorOptions}
          />
        </div>
      )}

      <div className={styles.collaborativeEditor} hidden={mode !== 'write'}>
        <MonacoEditor
          width={'100%'}
          height={'auto'}
          options={options}
          className={styles.editor}
          defaultLanguage="markdown"
          {...(hasVersion
            ? { value: version.md, onMount: handleEditorDidMount }
            : { onMount: handleCollaborativeEditorDidMount })}
        />
      </div>
    </>
  )
}
