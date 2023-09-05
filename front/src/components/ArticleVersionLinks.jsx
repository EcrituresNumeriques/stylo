import { Loading } from '@geist-ui/core'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import useGraphQL from '../hooks/graphql.js'
import styles from './articles.module.scss'

import { getArticleVersions } from './Article.graphql'

export default function ArticleVersionLinks ({ articleId, article }) {
  const { t } = useTranslation()
  const { data, isLoading } = useGraphQL({
    query: getArticleVersions,
    variables: { articleId }
  }, {
    fallbackData: {
      article
    },
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
  const versions = useMemo(() => data?.article?.versions || [], [data])

  if (isLoading) {
    return <Loading/>
  }

  return (
    <>
      {versions && versions.length > 0 &&
        <>
          <h4>{t('article.versions.title')}</h4>
          <ul className={styles.versions}>
            {versions.map((v) => (
              <li key={`version-${v._id}`}>
                <Link to={`/article/${article._id}/version/${v._id}`}>{`${
                  v.message ? v.message : 'no label'
                } (v${v.version}.${v.revision})`}</Link>
              </li>
            ))}
          </ul>
        </>
      }
    </>
  )
}
