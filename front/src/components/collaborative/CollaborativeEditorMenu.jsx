import React, { useCallback } from 'react'
import clsx from 'clsx'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { usePreferenceItem } from '../../hooks/user.js'
import useFetchData from '../../hooks/graphql.js'

import Export from '../Export.jsx'
import Loading from '../molecules/Loading.jsx'
import Sidebar from '../Sidebar.jsx'
import ArticleBibliography from '../bibliography/ArticleBibliography.jsx'
import ArticleMetadata from '../Write/ArticleMetadata.jsx'
import ArticleTableOfContents from './ArticleTableOfContents.jsx'
import CollaborativeVersions from './CollaborativeVersions.jsx'

import { getArticleInfo } from '../Article.graphql'

import styles from './CollaborativeEditorMenu.module.scss'

export default function CollaborativeEditorMenu({ articleId, className, versionId }) {
  const { t } = useTranslation()
  const { value: opened, toggleValue: setOpened } = usePreferenceItem(
    'expandSidebarRight',
    'article'
  )
  const { value: activeMenu, setValue: setActiveMenu } = usePreferenceItem(
    'activePanel',
    'article'
  )

  const onBack = useCallback(() => setActiveMenu(null), [])
  const { data, isLoading } = useFetchData(
    { query: getArticleInfo, variables: { articleId } },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  if (isLoading) {
    return <Loading />
  }

  return (
    <Sidebar
      className={clsx(className, opened && styles.opened)}
      opened={opened}
      setOpened={setOpened}
      labelOpened={t('editorMenu.open.label')}
      labelClosed={t('editorMenu.close.label')}
    >
      {!activeMenu && (
        <ul
          className={styles.entries}
          role="menubar"
          aria-orientation="vertical"
        >
          <li role="menuitem">
            <button onClick={() => setActiveMenu('toc')}>
              {t('toc.title')}
              <ChevronRight
                style={{ strokeWidth: 3 }}
                height={32}
                width={32}
                aria-hidden
              />
            </button>
          </li>

          <li role="menuitem">
            <button onClick={() => setActiveMenu('metadata')}>
              {t('metadata.title')}
              <ChevronRight
                style={{ strokeWidth: 3 }}
                height={32}
                width={32}
                aria-hidden
              />
            </button>
          </li>

          <li role="menuitem">
            <button onClick={() => setActiveMenu('bibliography')}>
              {t('bibliography.title')}
              <ChevronRight
                style={{ strokeWidth: 3 }}
                height={32}
                width={32}
                aria-hidden
              />
            </button>
          </li>

          <li role="menuitem">
            <button onClick={() => setActiveMenu('versions')}>
              {t('versions.title')}
              <ChevronRight
                style={{ strokeWidth: 3 }}
                height={32}
                width={32}
                aria-hidden
              />
            </button>
          </li>
          <li role="menuitem">
            <button
              onClick={() => setActiveMenu('export')}
              title={t('write.title.buttonExport')}
            >
              {t('export.title')}
              <ChevronRight
                style={{ strokeWidth: 3 }}
                height={32}
                width={32}
                aria-hidden
              />
            </button>
          </li>
          <li role="menuitem">
            <a
              href={`/article/${articleId}/annotate`}
              title={t('article.annotate.button')}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.external}
            >
              {t('annotate.title')}
            </a>
          </li>
        </ul>
      )}

      <div className={styles.content}>
        {activeMenu === 'metadata' && (
          <ArticleMetadata
            onBack={onBack}
            articleId={articleId}
            versionId={versionId}
          />
        )}
        {activeMenu === 'toc' && <ArticleTableOfContents onBack={onBack} />}
        {activeMenu === 'bibliography' && (
          <ArticleBibliography articleId={articleId} onBack={onBack} />
        )}
        {activeMenu === 'export' && (
          <>
            <h2
              className={styles.title}
              onClick={onBack}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ display: 'flex' }}>
                <ArrowLeft style={{ strokeWidth: 3 }} />
              </span>
              <span>{t('export.title')}</span>
            </h2>
            <Export
              articleId={articleId}
              name={data?.article?.title}
              bib={data?.article?.workingVersion?.bibPreview}
            />
          </>
        )}
        {activeMenu === 'versions' && (
          <CollaborativeVersions
            articleId={articleId}
            selectedVersion={versionId}
            showTitle={true}
            onBack={onBack}
          />
        )}
      </div>
    </Sidebar>
  )
}
