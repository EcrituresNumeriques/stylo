import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate } from 'react-router'

import { Toggle } from '@geist-ui/core'

import useFetchData from '../../hooks/graphql.js'

import Loading from '../molecules/Loading.jsx'
import CollaborativeEditorActiveVersion from './CollaborativeEditorActiveVersion.jsx'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'

import { getArticleInfo } from '../Article.graphql'

import styles from './CollaborativeEditorArticleHeader.module.scss'

/**
 * @param props
 * @param {string} props.articleId
 * @param {string?} props.versionId
 * @returns {import('react').ReactElementElement}
 */
export default function CollaborativeEditorArticleHeader({
  articleId,
  versionId,
}) {
  const { t } = useTranslation()
  const match = useMatch(
    versionId ? `/article/:id/version/:versionId/*` : `/article/:id/*`
  )
  const [mode, setMode] = useState('edit')
  const navigate = useNavigate()

  const { data, isLoading } = useFetchData(
    { query: getArticleInfo, variables: { articleId } },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      fallbackData: {
        article: {},
      },
    }
  )

  useEffect(() => {
    if (mode === 'preview') {
      navigate(`${match.pathnameBase}/preview`)
    } else {
      navigate(match.pathnameBase)
    }
  }, [mode])

  if (isLoading) {
    return <Loading />
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{data.article.title}</h1>

      <div className={styles.row}>
        <CollaborativeEditorActiveVersion versionId={versionId} />
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
    </header>
  )
}
