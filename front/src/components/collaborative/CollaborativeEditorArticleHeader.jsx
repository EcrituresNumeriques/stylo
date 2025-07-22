import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { Toggle } from '@geist-ui/core'

import useFetchData from '../../hooks/graphql.js'

import Loading from '../molecules/Loading.jsx'
import CollaborativeEditorActiveVersion from './CollaborativeEditorActiveVersion.jsx'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'

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
        <div
          className={styles.mode}
          onClick={() => setMode(mode === 'preview' ? 'edit' : 'preview')}
        >
          <Toggle
            id="preview-mode"
            checked={mode === 'preview'}
            title={t('article.editor.preview')}
            onChange={(e) => setMode(e.target.checked ? 'preview' : 'edit')}
          />
          <label htmlFor="preview-mode">{t('article.editor.preview')}</label>
        </div>

        <div className={styles.writers}>
          <CollaborativeEditorWriters />
        </div>
      </div>
      <CollaborativeEditorActiveVersion versionId={versionId} />
    </header>
  )
}
