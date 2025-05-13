import React, { useCallback } from 'react'
import { NavLink, useMatch } from 'react-router'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

import useFetchData from '../../hooks/graphql.js'

import Loading from '../molecules/Loading.jsx'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'
import CollaborativeEditorActiveVersion from './CollaborativeEditorActiveVersion.jsx'

import { getArticleInfo } from '../Article.graphql'

import styles from './CollaborativeEditorArticleHeader.module.scss'
import buttonStyles from '../button.module.scss'

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

  const activeClassName = useCallback(
    ({ isActive }) =>
      clsx(buttonStyles.linkSecondary, isActive && buttonStyles.activeLink),
    []
  )

  if (isLoading) {
    return <Loading />
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{data.article.title}</h1>

      <div className={styles.row}>
        <CollaborativeEditorActiveVersion versionId={versionId} />

        <ul
          className={buttonStyles.inlineGroup}
          aria-label={t('article.editor.modes.menuLabel')}
        >
          <li>
            <NavLink className={activeClassName} to={match.pathnameBase} end>
              {t('article.editor.modes.edit')}
            </NavLink>
          </li>
          <li>
            <NavLink
              className={activeClassName}
              to={`${match.pathnameBase}/preview`}
              end
            >
              {t('article.editor.modes.preview')}
            </NavLink>
          </li>
        </ul>

        <div className={styles.writers}>
          <CollaborativeEditorWriters />
        </div>
      </div>
    </header>
  )
}
