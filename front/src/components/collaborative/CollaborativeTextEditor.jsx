import Editor from '@monaco-editor/react'
import clsx from 'clsx'
import throttle from 'lodash.throttle'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { MonacoBinding } from 'y-monaco'
import { useArticleVersion, useEditableArticle } from '../../hooks/article.js'
import { useBibliographyCompletion } from '../../hooks/bibliography.js'
import { useCollaboration } from '../../hooks/collaboration.js'
import Alert from '../molecules/Alert.jsx'

import Loading from '../molecules/Loading.jsx'
import defaultEditorOptions from '../Write/providers/monaco/options.js'
import CollaborativeEditorStatus from './CollaborativeEditorStatus.jsx'
import CollaborativeEditorWebSocketStatus from './CollaborativeEditorWebSocketStatus.jsx'

import styles from './CollaborativeTextEditor.module.scss'

/**
 * @param {object} props
 * @param {string} props.articleId
 * @param {string|undefined} props.versionId
 * @returns {Element}
 */
export default function CollaborativeTextEditor({ articleId, versionId }) {
  const { yText, awareness, websocketStatus, dynamicStyles } = useCollaboration(
    { articleId, versionId }
  )
  const { version, error, isLoading } = useArticleVersion({ versionId })
  const { provider: bibliographyCompletionProvider } =
    useBibliographyCompletion()
  const { bibliography } = useEditableArticle({
    articleId,
    versionId,
  })
  const dispatch = useDispatch()
  const editorRef = useRef(null)
  const editorCursorPosition = useSelector(
    (state) => state.editorCursorPosition,
    shallowEqual
  )

  const hasVersion = useMemo(() => !!versionId, [versionId])

  const options = useMemo(
    () => ({
      ...defaultEditorOptions,
      contextmenu: hasVersion ? false : websocketStatus === 'connected',
      readOnly: hasVersion ? true : websocketStatus !== 'connected',
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
      const completionProvider = bibliographyCompletionProvider.register(monaco)
      editor.onDidDispose(() => completionProvider.dispose())
      if (yText && awareness) {
        new MonacoBinding(
          yText,
          editor.getModel(),
          new Set([editor]),
          awareness
        )
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
      yText.observe(function () {
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

  if (!yText && !version) {
    return <Loading />
  }

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <Alert message={error.message} />
  }

  return (
    <>
      <style>{dynamicStyles}</style>
      <CollaborativeEditorStatus versionId={versionId} />
      <div className={styles.inlineStatus}>
        <CollaborativeEditorWebSocketStatus status={websocketStatus} />
      </div>
      {version && (
        <Editor
          width={'100%'}
          height={'auto'}
          value={version.md}
          options={options}
          className={styles.editor}
          defaultLanguage="markdown"
          onMount={handleEditorDidMount}
        />
      )}
      <div
        className={clsx(styles.collaborativeEditor, versionId && styles.hidden)}
      >
        <Editor
          width={'100%'}
          height={'auto'}
          options={options}
          className={styles.editor}
          defaultLanguage="markdown"
          onMount={handleCollaborativeEditorDidMount}
        />
      </div>
    </>
  )
}
