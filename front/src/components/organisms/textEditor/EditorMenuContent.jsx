import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'

import ArticleBibliography from '../bibliography/ArticleBibliography.jsx'
import Export from '../export/Export.jsx'
import ArticleMetadata from '../metadata/ArticleMetadata.jsx'
import ArticleData from '../nakala/ArticleData.jsx'
import ArticleTableOfContents from './ArticleTableOfContents.jsx'
import CollaborativeVersions from './CollaborativeVersions.jsx'
import styles from './EditorMenu.module.scss'
import EditorValidation from './EditorValidation.jsx'

export default function EditorMenuContent({
  articleId,
  versionId,
  activeMenu,
  writers,
  structure,
  workingCopyStatus,
  onCursorPositionChange,
  validationDiagnostics = [],
  isValidating = false,
  hasValidated = false,
  enabledProfiles = [],
  onProfileToggle,
  onNavigateToDiagnostic,
}) {
  const { article } = useRouteLoaderData('article')
  const { t } = useTranslation()

  if (!activeMenu) {
    return null
  }

  return (
    <div className={clsx(styles.content, styles.active)}>
      {activeMenu === 'metadata' && (
        <ArticleMetadata
          articleId={articleId}
          versionId={versionId}
          writers={writers}
        />
      )}
      {activeMenu === 'toc' && (
        <ArticleTableOfContents
          structure={structure}
          onCursorPositionChange={onCursorPositionChange}
        />
      )}
      {activeMenu === 'bibliography' && (
        <ArticleBibliography articleId={articleId} />
      )}
      {activeMenu === 'data' && <ArticleData articleId={articleId} />}
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
          workingCopyStatus={workingCopyStatus}
        />
      )}
      {activeMenu === 'validation' && (
        <EditorValidation
          diagnostics={validationDiagnostics}
          isValidating={isValidating}
          hasValidated={hasValidated}
          enabledProfiles={enabledProfiles}
          onProfileToggle={onProfileToggle}
          onNavigate={onNavigateToDiagnostic}
        />
      )}
    </div>
  )
}
