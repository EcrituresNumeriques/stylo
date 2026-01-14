import clsx from 'clsx'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import useFetchData from '../hooks/graphql.js'

import TimeAgo from './TimeAgo.jsx'
import Loading from './molecules/Loading.jsx'

import { getArticleVersions } from '../hooks/Article.graphql'

import styles from './articleVersionLinks.module.scss'

export default function ArticleVersionLinks({ articleId, article }) {
  const { t } = useTranslation()
  const { data, isLoading } = useFetchData(
    {
      query: getArticleVersions,
      variables: { articleId },
    },
    {
      fallbackData: {
        article,
      },
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const getVersions = () =>
    (data?.article?.versions || []).map((v) => {
      let title
      if (v.type === 'editingSessionEnded') {
        title = t('versions.editingSessionEnded.text')
      } else if (v.type === 'collaborativeSessionEnded') {
        title = t('versions.collaborativeSessionEnded.text')
      } else {
        title = `v${v.version}.${v.revision} ${v.message}`
      }
      return {
        ...v,
        type: v.type || 'userAction',
        title,
      }
    })
  const versions = useMemo(getVersions, [data])

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      {versions && versions.length > 0 && (
        <>
          <h3>{t('article.versions.title')}</h3>
          <ul className={styles.versions}>
            {versions.map((v) => (
              <li
                key={`version-${v._id}`}
                className={clsx(
                  v.type === 'userAction'
                    ? styles.userVersion
                    : styles.automaticVersion
                )}
              >
                <Link to={`/article/${article._id}/version/${v._id}`}>
                  <span>{v.title}</span> <TimeAgo date={v.createdAt} />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
