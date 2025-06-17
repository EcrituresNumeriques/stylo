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
 * @param {string} props.articleId
 * @param {string?} props.versionId
 * @returns {import('react').ReactElementElement}
 */
export default function CollaborativeEditorArticleHeader({
  articleId,
  versionId,
}) {
  const { t } = useTranslation()

  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState('edit')

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
    if (mode === 'preview' && searchParams.get('mode') !== 'preview') {
      setSearchParams({ mode: 'preview' })
    } else if (searchParams.get('mode') === 'preview') {
      setSearchParams({})
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
