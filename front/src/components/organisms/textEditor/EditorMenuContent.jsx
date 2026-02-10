import clsx from 'clsx'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'

import ArticleBibliography from '../bibliography/ArticleBibliography.jsx'
import Export from '../export/Export.jsx'
import ArticleMetadata from '../metadata/ArticleMetadata.jsx'
import ArticleTableOfContents from './ArticleTableOfContents.jsx'
import CollaborativeVersions from './CollaborativeVersions.jsx'

import styles from './EditorMenu.module.scss'

export default function EditorMenuContent({
  articleId,
  versionId,
  activeMenu,
}) {
  const { article } = useRouteLoaderData('article')
  const { t } = useTranslation()

  if (activeMenu === '') {
    return <></>
  }

  return (
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
  )
}
