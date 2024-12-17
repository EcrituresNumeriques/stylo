import clsx from 'clsx'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styles from './articleVersionLinks.module.scss'

import TimeAgo from './TimeAgo.jsx'

/**
 * @typedef {Object} ArticleVersionLinksProps
 * @property {string} articleId
 * @property {ArticleVersion[]} versions
 */

/**
 *
 * @param {ArticleVersionLinksProps} props
 * @returns {React.ReactElement}
 */
export default function ArticleVersionLinks({
  articleId,
  versions: rawVersions,
}) {
  const { t } = useTranslation()

  const versions = useMemo(
    () =>
      (rawVersions || []).map((v) => {
        let title = ''
        if (v.type === 'editingSessionEnded') {
          title = t('version.editingSessionEnded.text')
        } else if (v.type === 'collaborativeSessionEnded') {
          title = t('version.collaborativeSessionEnded.text')
        } else {
          title = `v${v.version}.${v.revision} ${v.message}`
        }
        return {
          ...v,
          type: v.type || 'userAction',
          title,
        }
      }),
    [rawVersions]
  )

  if (!Array.isArray(versions) || versions.length === 0) {
    return null
  }

  return (
    <aside>
      <h4>{t('article.versions.title')}</h4>

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
            <Link to={`/article/${articleId}/version/${v._id}`}>
              <span>{v.title}</span> <TimeAgo date={v.createdAt} />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
