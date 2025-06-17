import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate } from 'react-router'

import useFetchData from '../../hooks/graphql.js'

import CollaborativeEditorActiveVersion from './CollaborativeEditorActiveVersion.jsx'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'
import Loading from '../molecules/Loading.jsx'
import Toggle from '../molecules/Toggle.jsx'

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
    if (mode === 'preview' && match.params['*'] === '') {
      navigate(`${match.pathnameBase}?mode=preview`)
    } else if (match.params['*'] !== '') {
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
