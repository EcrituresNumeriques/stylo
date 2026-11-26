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
import { onDropIntoEditor } from '../bibliography/support.js'
import defaultEditorOptions from '../monaco/options.js'
import {
  actions,
  MarkdownMenu,
  MetopesMenu,
  registerActions,
  Separator,
} from './actions/index.js'

import CollaborativeEditorArticleHeader from './CollaborativeEditorArticleHeader.jsx'
import CollaborativeEditorWebSocketStatus from './CollaborativeEditorWebSocketStatus.jsx'

import styles from './CollaborativeTextEditor.module.scss'

/**
 * @typedef {import('monaco-editor/editor').editor.IStandaloneCodeEditor} IStandaloneCodeEditor
 * @typedef {import('monaco-editor/editor')} monaco
 */

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
      registerActions(editor, t, actions.markdown)
      registerActions(
        editor,
        t,
        actions.saveShortcut(() => setActiveMenu('versions'))
      )

      const completionProvider = bibliographyCompletionProvider.register(monaco)
      editor.onDidDispose(() => completionProvider.dispose())

      const model = editor.getModel()
      // Set EOL to LF otherwise it causes synchronization issues due to inconsistent EOL between Windows and Linux.
      // https://github.com/yjs/y-monaco/issues/27
      model.setEOL(monaco.editor.EndOfLineSequence.LF)
      if (yText && awareness) {
        // y-monaco imports Monaco: it is loaded once Monaco is
        import('y-monaco').then(({ MonacoBinding }) => {
          new MonacoBinding(yText, model, new Set([editor]), awareness)
        })
      }

      setIsEditorMounted(true)
      onEditorReadyRef.current?.()
    },
    [yText, awareness]
  )

  const handleEditorDidMount = useCallback((editor) => {
    editorRef.current = editor
    setIsEditorMounted(true)
    onEditorReadyRef.current?.()
  }, [])

  let timeoutId
  useEffect(() => {
    if (yText) {
      updateArticleStructureAndStats({ text: yText.toString() })
      yText.observe(() => {
        onWorkingCopyStatusChange?.('syncing')
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
          onWorkingCopyStatusChange?.('synced')
        }, 4000)

        updateArticleStructureAndStats({ text: yText.toString() })
      })
    }
  }, [articleId, versionId, yText])

  useEffect(() => {
    if (versionId) {
      onStatsChange?.(version.md)
      onStructureChange?.(version.md)
    }
  }, [versionId])

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
          language="markdown"
          {...(hasVersion
            ? { value: version.md, onMount: handleEditorDidMount }
            : { onMount: handleCollaborativeEditorDidMount })}
        />
      </div>
    </>
  )
}
