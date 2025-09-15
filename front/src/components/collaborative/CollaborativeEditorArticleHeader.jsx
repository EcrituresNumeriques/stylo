import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import useFetchData from '../../hooks/graphql.js'

import CollaborativeEditorActiveVersion from './CollaborativeEditorActiveVersion.jsx'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'
import Loading from '../molecules/Loading.jsx'
import Toggle from '../molecules/Toggle.jsx'

import { getArticleInfo } from '../Article.graphql'

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
  const [mode, setMode] = useState('edit')

  useEffect(() => {
    if (mode === 'preview' && searchParams.get('mode') !== 'preview') {
      setSearchParams({ mode: 'preview' })
    } else if (searchParams.get('mode') === 'preview') {
      setSearchParams({})
    }
  }, [mode])

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{articleTitle}</h1>

      <div className={styles.row}>
        <Toggle
          id="preview-mode"
          checked={mode === 'preview'}
          title={t('article.editor.preview')}
          onChange={(checked) => setMode(checked ? 'preview' : 'edit')}
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
