import clsx from 'clsx'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useArticleWorkingCopy } from '../../hooks/article.js'
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

export default function CollaborativeEditorMenu({ articleId, versionId }) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const [activeMenu, setActiveMenu] = useState('')
  const { article, updateMetadata } = useArticleWorkingCopy({ articleId })
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

  const metadata = article?.workingVersion?.metadata

  return (
    <div className={styles.menu} role="menu">
      <Sidebar
        className={clsx(styles.container, opened && styles.opened)}
        opened={opened}
        setOpened={setOpened}
        labelOpened={t('editorMenu.open.label')}
        labelClosed={t('editorMenu.close.label')}
      >
        <section>
          {activeMenu === '' && (
            <div className={styles.entries}>
              <a href="#" onClick={() => setActiveMenu('toc')}>
                {t('toc.title')}
                <ChevronRight
                  style={{ strokeWidth: 3 }}
                  height={32}
                  width={32}
                />
              </a>
              <a href="#" onClick={() => setActiveMenu('metadata')}>
                {t('metadata.title')}
                <ChevronRight
                  style={{ strokeWidth: 3 }}
                  height={32}
                  width={32}
                />
              </a>
              <a href="#" onClick={() => setActiveMenu('bibliography')}>
                {t('bibliography.title')}
                <ChevronRight
                  style={{ strokeWidth: 3 }}
                  height={32}
                  width={32}
                />
              </a>

              <a onClick={() => setActiveMenu('versions')}>
                {t('versions.title')}
                <ChevronRight
                  style={{ strokeWidth: 3 }}
                  height={32}
                  width={32}
                />
              </a>
              <a
                href="#"
                onClick={() => setActiveMenu('export')}
                title="Download a printable version"
              >
                {t('export.title')}
                <ChevronRight
                  style={{ strokeWidth: 3 }}
                  height={32}
                  width={32}
                />
              </a>
              <a
                href={`/article/${articleId}/preview`}
                title="Preview (open a new window)"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.external}
              >
                {t('annotate.title')}
              </a>
            </div>
          )}
          <div className={styles.content}>
            {activeMenu === 'metadata' && (
              <ArticleMetadata
                onBack={() => setActiveMenu('')}
                metadata={metadata}
                onChange={(metadata) => updateMetadata(metadata)}
              />
            )}
            {activeMenu === 'toc' && (
              <ArticleTableOfContents onBack={() => setActiveMenu('')} />
            )}
            {activeMenu === 'bibliography' && (
              <ArticleBibliography
                articleId={articleId}
                onBack={() => setActiveMenu('')}
              />
            )}
            {activeMenu === 'export' && (
              <>
                <h2
                  className={styles.title}
                  onClick={() => setActiveMenu('')}
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
                onBack={() => setActiveMenu('')}
              />
            )}
          </div>
        </section>
      </Sidebar>
    </div>
  )
}
