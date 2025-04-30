import React from 'react'
import { Helmet } from 'react-helmet'

import useFetchData from '../../hooks/graphql.js'

import Loading from '../molecules/Loading.jsx'

import { getArticleInfo } from '../Article.graphql'

import styles from './CollaborativeEditorArticleHeader.module.scss'

/**
 * @param props
 * @param {string} props.articleId
 * @returns {import('react').ReactElementElement}
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

      <Helmet>
        <title>{data?.article?.title}</title>
      </Helmet>
    </header>
  )
}
