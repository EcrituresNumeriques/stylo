import clsx from 'clsx'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useRouteLoaderData } from 'react-router'

import { trackEvent } from '../../helpers/analytics.js'
import { usePreferenceItem } from '../../hooks/user.js'

import Export from '../Export.jsx'
import Sidebar from '../Sidebar.jsx'
import ArticleMetadata from '../Write/ArticleMetadata.jsx'
import ArticleBibliography from '../bibliography/ArticleBibliography.jsx'
import ArticleTableOfContents from './ArticleTableOfContents.jsx'
import CollaborativeVersions from './CollaborativeVersions.jsx'

import styles from './CollaborativeEditorMenu.module.scss'

export default function CollaborativeEditorMenu({
  articleId,
  className,
  versionId,
}) {
  const { user } = useRouteLoaderData('app')
  const { article } = useRouteLoaderData('article')
  const { t } = useTranslation()
  const { value: opened, toggleValue: setOpened } = usePreferenceItem(
    'expandSidebarRight',
    'article'
  )
  const { value: activeMenu, setValue: setActiveMenu } = usePreferenceItem(
    'activePanel',
    'article'
  )

  const handleNavigateBack = useCallback(() => {
    trackEvent('ArticleMenuNavigation', 'back', '', '', {
      articleId,
      userId: user._id,
    })
    setActiveMenu(null)
  }, [setActiveMenu])

  const handleNavigateTo = useCallback(
    (name) => {
      trackEvent('ArticleMenuNavigation', 'goto', name, '', {
        articleId,
        userId: user._id,
      })
      setActiveMenu(name)
    },
    [setActiveMenu]
  )

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
            <button onClick={() => handleNavigateTo('toc')}>
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
            <button onClick={() => handleNavigateTo('metadata')}>
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
            <button onClick={() => handleNavigateTo('bibliography')}>
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
            <button onClick={() => handleNavigateTo('versions')}>
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
              onClick={() => handleNavigateTo('export')}
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
            <Link
              to="annotate"
              relative={true}
              title={t('article.annotate.button')}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.external}
            >
              {t('annotate.title')}
            </Link>
          </li>
        </ul>
      )}

      <div className={styles.content}>
        {activeMenu === 'metadata' && (
          <ArticleMetadata
            onBack={handleNavigateBack}
            articleId={articleId}
            versionId={versionId}
          />
        )}
        {activeMenu === 'toc' && (
          <ArticleTableOfContents onBack={handleNavigateBack} />
        )}
        {activeMenu === 'bibliography' && (
          <ArticleBibliography
            articleId={articleId}
            onBack={handleNavigateBack}
          />
        )}
        {activeMenu === 'export' && (
          <>
            <h2
              className={styles.title}
              onClick={handleNavigateBack}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ display: 'flex' }}>
                <ArrowLeft style={{ strokeWidth: 3 }} />
              </span>
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
            onBack={handleNavigateBack}
          />
        )}
      </div>
    </Sidebar>
  )
}
