import clsx from 'clsx'
import {
  BookMarked,
  History,
  Maximize2,
  MessageSquare,
  Minimize2,
  Printer,
  TableOfContents,
  TextCursorInput,
} from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useRouteLoaderData } from 'react-router'

import ArticleBibliography from '../bibliography/ArticleBibliography.jsx'
import Export from '../export/Export.jsx'
import ArticleMetadata from '../metadata/ArticleMetadata.jsx'
import ArticleTableOfContents from './ArticleTableOfContents.jsx'
import CollaborativeVersions from './CollaborativeVersions.jsx'
import EditorMenuItem from './EditorMenuItem.jsx'

import styles from './EditorMenu.module.scss'

export default function EditorMenu({ articleId, versionId }) {
  const { article } = useRouteLoaderData('article')
  const { t } = useTranslation()
  const [minimized, setMinimized] = useState(false)
  const [activeMenu, setActiveMenu] = useState('')

  const handleAnnotate = useCallback(
    () => window.open(location.pathname + '/annotate', '_blank').focus(),
    []
  )

  const toggleActiveMenu = useCallback(
    (name) => (_) =>
      activeMenu === name ? setActiveMenu('') : setActiveMenu(name),
    [activeMenu]
  )

  return (
    <>
      {activeMenu !== '' && (
        <div className={clsx(styles.content, styles.active)}>
          {activeMenu === 'metadata' && (
            <ArticleMetadata articleId={articleId} versionId={versionId} />
          )}
          {activeMenu === 'toc' && <ArticleTableOfContents />}
          {activeMenu === 'bibliography' && (
            <ArticleBibliography articleId={articleId} />
          )}
          {activeMenu === 'export' && (
            <>
              <h2 style={{ cursor: 'pointer', userSelect: 'none' }}>
                <span>{t('export.title')}</span>
              </h2>
              <Export
                articleId={articleId}
                name={article?.title}
                bib={article?.workingVersion?.bibPreview}
              />
            </>
          )}
          {activeMenu === 'versions' && (
            <CollaborativeVersions
              articleId={articleId}
              selectedVersion={versionId}
              showTitle={true}
            />
          )}
        </div>
      )}
      <div className={styles.menu}>
        <button
          className={styles.toggleMinimized}
          onClick={() => setMinimized(!minimized)}
        >
          {!minimized && <span>{t('collapse.title')}</span>}
          <span>{minimized ? <Maximize2 /> : <Minimize2 />}</span>
        </button>
        <div className={styles.items}>
          <EditorMenuItem
            onClick={toggleActiveMenu('toc')}
            selected={activeMenu === 'toc'}
            minimized={minimized}
            icon={<TableOfContents />}
            text={t('toc.title')}
          />
          <EditorMenuItem
            onClick={toggleActiveMenu('metadata')}
            selected={activeMenu === 'metadata'}
            minimized={minimized}
            icon={<TextCursorInput />}
            text={t('metadata.title')}
          />
          <EditorMenuItem
            onClick={toggleActiveMenu('bibliography')}
            selected={activeMenu === 'bibliography'}
            minimized={minimized}
            icon={<BookMarked />}
            text={t('bibliography.title')}
          />
          <EditorMenuItem
            onClick={toggleActiveMenu('versions')}
            selected={activeMenu === 'versions'}
            minimized={minimized}
            icon={<History />}
            text={t('versions.title')}
          />
          <EditorMenuItem
            onClick={toggleActiveMenu('export')}
            selected={activeMenu === 'export'}
            minimized={minimized}
            icon={<Printer />}
            text={t('export.title')}
          />
          <EditorMenuItem
            onClick={handleAnnotate}
            selected={activeMenu === 'annotate'}
            minimized={minimized}
            icon={<MessageSquare />}
            text={t('annotate.title')}
          />
        </div>
      </div>
    </>
  )
}
