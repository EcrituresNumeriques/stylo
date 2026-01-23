import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { Toggle } from '../molecules/index.js'

import CollaborativeEditorActiveVersion from './CollaborativeEditorActiveVersion.jsx'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'

import styles from './CollaborativeEditorArticleHeader.module.scss'

/**
 * @param props
 * @param {string} props.articleTitle
 * @param {string?} props.versionId
 * @returns {import('react').ReactElementElement}
 */
export default function CollaborativeEditorArticleHeader({
  articleTitle,
  versionId,
}) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const searchParamMode = useMemo(
    () => searchParams.get('mode'),
    [searchParams]
  )

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{articleTitle}</h1>

      <div className={styles.row}>
        <Toggle
          id="preview-mode"
          checked={searchParamMode === 'preview'}
          title={t('article.editor.preview')}
          onChange={(checked) =>
            setSearchParams(checked ? { mode: 'preview' } : {})
          }
        >
          {t('article.editor.preview')}
        </Toggle>

        <div className={styles.writers}>
          <CollaborativeEditorWriters />
        </div>
      </div>
      <CollaborativeEditorActiveVersion versionId={versionId} />
    </header>
  )
}
