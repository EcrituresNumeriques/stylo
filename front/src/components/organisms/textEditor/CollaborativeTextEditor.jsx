import clsx from 'clsx'
import throttle from 'lodash.throttle'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

import { isFocusLost } from '../../../helpers/focus.js'
import {
  useArticleMetadata,
  useArticleVersion,
  useEditableArticle,
} from '../../../hooks/article.js'
import { useBibliographyCompletion } from '../../../hooks/bibliography.js'
import { useCollaboration } from '../../../hooks/collaboration.js'
import { useStyloExportPreview } from '../../../hooks/stylo-export.js'
import { useMarkdownValidator } from '../../../hooks/useMarkdownValidator.js'
import { usePreferenceItem } from '../../../hooks/user.js'
import {
  Alert,
  Loading,
  MonacoDiffEditor,
  MonacoEditor,
} from '../../molecules/index.js'
import defaultEditorOptions from '../monaco/options.js'
import { actionTypes } from './actions/index.js'
import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeEditorWebSocketStatus from './CollaborativeEditorWebSocketStatus.jsx'
import styles from './CollaborativeTextEditor.module.scss'
import {
  bibliographyCompletion,
  contextActions,
  imageDrop,
  realtime,
  snippetCompletionProvider,
} from './plugins/index.js'

/**
 * @param {object} props
 * @param {string} props.articleId
 * @param {string|undefined} props.versionId
 * @param {'write' | 'compare' | 'preview'} props.mode
 * @param {object} props.writers
 * @param {{ lineNumber: number, column: number }} props.cursorPosition
 * @param {function} props.onWritersChange
 * @param {function} props.onStatsChange
 * @param {function} props.onStructureChange
 * @param {function} props.onWorkingCopyStatusChange
 * @param {string[]} [props.profiles] - active validator profile ids
 * @param {(api: {validate: () => Promise<void>, clearDiagnostics: () => void, diagnostics: Array, isValidating: boolean}) => void} [props.onValidatorReady]
 * @returns {Element}
 */
const diffOptions = {
  ...defaultEditorOptions,
  // typing in the diff would not be saved
  readOnly: true,
  // the version on the left, even in a narrow editor (< 900 px)
  useInlineViewWhenSpaceIsLimited: false,
  // both sides wrap the same way
  diffWordWrap: 'on',
}

export default function CollaborativeTextEditor({
  articleId,
  versionId,
  mode,
  writers,
  cursorPosition,
  onWritersChange,
  onStatsChange,
  onStructureChange,
  onWorkingCopyStatusChange,
  profiles = [],
  onValidatorReady,
  onEditorReady,
}) {
  const { yText, awareness, websocketStatus, isSynced, dynamicStyles } =
    useCollaboration({ articleId, versionId, onWritersChange })
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

  const { value: activeMenu, setValue: setActiveMenu } = usePreferenceItem(
    `${articleId}.activeMenu`,
    'article'
  )

  const { metadata } = useArticleMetadata({ articleId, versionId })

  const { html: __html, isLoading: isPreviewLoading } = useStyloExportPreview({
    ...(mode === 'preview'
      ? {
          md_content: versionId ? version.md : yText?.toString(),
          metadata,
          bib_content: versionId ? version.bib : article?.workingVersion?.bib,
        }
      : {}),
    with_toc: true,
    with_nocite: true,
    with_link_citations: true,
  })

  const validationContext = useMemo(() => ({ metadata }), [metadata])

  const editorRef = useRef(null)
  const [isEditorMounted, setIsEditorMounted] = useState(false)
  const hasInitialFocusRef = useRef(false)
  const onEditorReadyRef = useRef(onEditorReady)
  onEditorReadyRef.current = onEditorReady
  const {
    validate,
    diagnostics,
    isValidating,
    hasValidated,
    clearDiagnostics,
    navigateTo,
  } = useMarkdownValidator(editorRef, profiles, validationContext)

  const hasVersion = useMemo(() => Boolean(versionId), [versionId])
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
        onStatsChange?.(md)
        onStructureChange?.(md)
      },
      250,
      { leading: false, trailing: true }
    ),
    []
  )

  // a version is read only: no actions, nor real time
  const plugins = useMemo(
    () =>
      hasVersion
        ? []
        : [
            contextActions({ t, onSave: () => setActiveMenu('versions') }),
            bibliographyCompletion(bibliographyCompletionProvider),
            snippetCompletionProvider({
              t,
              namespace: 'metopes',
              types: [actionTypes.DELIMITED_BLOCK],
            }),
            imageDrop(),
            ...(yText && awareness ? [realtime({ yText, awareness })] : []),
          ],
    [
      hasVersion,
      yText,
      awareness,
      t,
      setActiveMenu,
      bibliographyCompletionProvider,
    ]
  )

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor
    setIsEditorMounted(true)
    onEditorReadyRef.current?.()
  }, [])

  let timeoutId
  useEffect(() => {
    if (yText) {
      // on a version, the structure and the stats are those of the version,
      // not of the working copy
      const updateFromWorkingCopy = () =>
        versionId || updateArticleStructureAndStats({ text: yText.toString() })

      updateFromWorkingCopy()
      yText.observe(() => {
        onWorkingCopyStatusChange?.('syncing')
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
          onWorkingCopyStatusChange?.('synced')
        }, 4000)

        updateFromWorkingCopy()
      })
    }
  }, [articleId, versionId, yText])

  // the working copy, compared with the version, follows the shared document
  const [workingCopy, setWorkingCopy] = useState()
  useEffect(() => {
    if (mode !== 'compare' || !yText) {
      return
    }
    const update = throttle(() => setWorkingCopy(yText.toString()), 250)
    update()
    yText.observe(update)
    return () => {
      yText.unobserve(update)
      update.cancel()
    }
  }, [mode, yText])

  // the version is empty until it is received from the server
  useEffect(() => {
    if (versionId && version.md !== undefined) {
      onStatsChange?.(version.md)
      onStructureChange?.(version.md)
    }
  }, [versionId, version.md])

  useEffect(() => {
    if (bibliography) {
      bibliographyCompletionProvider.bibTeXEntries = bibliography.entries
    }
  }, [bibliography])

  useEffect(() => {
    onValidatorReady?.({
      validate,
      diagnostics,
      isValidating,
      hasValidated,
      clearDiagnostics,
      navigateTo,
    })
  }, [
    validate,
    diagnostics,
    isValidating,
    hasValidated,
    clearDiagnostics,
    navigateTo,
    onValidatorReady,
  ])

  // Gives the focus to the editor once, when the article opens and its
  // content has been received (otherwise the text would be inserted before
  // the cursor), unless the user has already moved it.
  // Reconnections must not steal the focus back.
  useEffect(() => {
    if (hasInitialFocusRef.current || !isEditorMounted || mode !== 'write') {
      return
    }
    if (!hasVersion && !isSynced) {
      return
    }
    hasInitialFocusRef.current = true
    const editor = editorRef.current
    if (editor && isFocusLost()) {
      // the cursor must be visible, otherwise nothing shows that the editor
      // has the focus
      const start = { lineNumber: 1, column: 1 }
      editor.setPosition(start)
      editor.revealPosition(start)
      editor.focus()
      // the first line sits at the top of the editor: bring it into view
      const container = editor.getContainerDomNode()
      const { top } = container.getBoundingClientRect()
      if (top < 0 || top > window.innerHeight - 40) {
        container.scrollIntoView({ block: 'start' })
      }
    }
  }, [isEditorMounted, mode, hasVersion, isSynced])

  useEffect(() => {
    if (!cursorPosition) return
    const line = cursorPosition.lineNumber
    const editor = editorRef.current
    editor?.focus()
    const endOfLineColumn = editor?.getModel()?.getLineMaxColumn(line + 1)
    editor?.setPosition({ lineNumber: line + 1, column: endOfLineColumn })
    editor?.revealLineNearTop(line + 1, 1) // smooth
  }, [editorRef, cursorPosition])

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
        writers={writers}
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
          <MonacoDiffEditor
            className={styles.editor}
            width={'100%'}
            height={'auto'}
            // the shared document is empty until it is synchronised
            modified={isSynced ? workingCopy : article.workingVersion?.md}
            original={version.md}
            language="markdown"
            options={diffOptions}
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
          language="markdown"
          plugins={plugins}
          onMount={handleEditorDidMount}
          {...(hasVersion ? { value: version.md } : {})}
        />
      </div>
    </>
  )
}
