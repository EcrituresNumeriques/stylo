import React from 'react'

import useFetchData from '../../hooks/graphql.js'

import Loading from '../molecules/Loading.jsx'

import { getArticleInfo } from '../Article.graphql'

import styles from './CollaborativeEditorArticleHeader.module.scss'

/**
 * @param props
 * @param {string} props.articleId
 * @return {Element}
 */
export default function CollaborativeEditorArticleHeader({ articleId }) {
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
    <header className={styles.header}>
      <h1 className={styles.title}>{data?.article?.title}</h1>
    </header>
  )
}
