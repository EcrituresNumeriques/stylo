import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { MonacoBinding } from 'y-monaco'

import { DiffEditor } from '@monaco-editor/react'
import throttle from 'lodash.throttle'
import 'monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css'

import {
  useArticleVersion,
  useEditableArticle,
} from '../../../hooks/article.js'
import { useBibliographyCompletion } from '../../../hooks/bibliography.js'
import { useCollaboration } from '../../../hooks/collaboration.js'
import { useStyloExportPreview } from '../../../hooks/stylo-export.js'
import { Alert, Loading, MonacoEditor } from '../../molecules/index.js'
import { onDropIntoEditor } from '../bibliography/support.js'
import defaultEditorOptions from '../monaco/options.js'
import {
  MarkdownMenu,
  MetopesMenu,
  Separator,
  actions,
  registerActions,
} from './actions/index.js'

import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeEditorWebSocketStatus from './CollaborativeEditorWebSocketStatus.jsx'

import styles from './CollaborativeTextEditor.module.scss'

/**
 * @typedef {import('monaco-editor').editor.IStandaloneCodeEditor} IStandaloneCodeEditor
 * @typedef {import('monaco-editor')} monaco
 */

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
  const { t } = useTranslation('editor')

  const {
    version,
    error,
    isLoading: isVersionLoading,
  } = useArticleVersion({ versionId })
  const { provider: bibliographyCompletionProvider } =
    useBibliographyCompletion()
  const {
    article,
    bibliography,
    isLoading: isWorkingVersionLoading,
  } = useEditableArticle({
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
  const isLoading =
    yText === null ||
    isPreviewLoading ||
    isWorkingVersionLoading ||
    isVersionLoading

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

  const updateArticleStructureAndStats = useCallback(
    throttle(
      ({ text: md }) => {
        dispatch({ type: 'UPDATE_ARTICLE_STATS', md })
        dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md })
      },
      250,
      { leading: false, trailing: true }
    ),
    []
  )

  const handleCollaborativeEditorDidMount = useCallback(
    (
      /** @type {IStandaloneCodeEditor} */ editor,
      /** @type {monaco} */ monaco
    ) => {
      editorRef.current = editor

      editor.onDropIntoEditor(onDropIntoEditor(editor))

      const contextMenu = editor.getContribution('editor.contrib.contextmenu')
      const originalMenuActions = contextMenu._getMenuActions(
        editor.getModel(),
        editor.contextMenuId
      )

      contextMenu._getMenuActions = function _getStyloCustomMenuActions() {
        return [
          ...originalMenuActions,
          new Separator(),
          MetopesMenu({ editor, t }),
          MarkdownMenu({ editor, t }),
        ]
      }

      // Command Palette commands
      registerActions(editor, t, actions.metopes)
      registerActions(editor, t, actions.md, { palette: false })

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
      updateArticleStructureAndStats({ text: yText.toString() })
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

        updateArticleStructureAndStats({ text: yText.toString() })
      })
    }
  }, [articleId, versionId, yText])

  useEffect(() => {
    if (versionId) {
      dispatch({ type: 'UPDATE_ARTICLE_STATS', md: version.md })
      dispatch({ type: 'UPDATE_ARTICLE_STRUCTURE', md: version.md })
    }
  }, [versionId])

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

      <CollaborativeEditorArticleHeader
        articleTitle={article.title}
        versionId={versionId}
      />

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

      <div
        className={clsx(
          styles.collaborativeEditor,
          mode !== 'write' && styles.hidden
        )}
      >
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
