import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import styles from './articleEditorMenu.module.scss'
import ArticleVersions from './ArticleVersions.jsx'
import Sommaire from './Sommaire'
import Versions from './Versions'
import { Sidebar } from 'lucide-react'

export default function ArticleEditorMenu({
  articleInfos,
  readOnly,
  compareTo,
  selectedVersion,
}) {
  const expanded = useSelector(
    (state) => state.articlePreferences.expandSidebarLeft
  )
  const dispatch = useDispatch()
  const toggleExpand = useCallback(
    () =>
      dispatch({
        type: 'ARTICLE_PREFERENCES_TOGGLE',
        key: 'expandSidebarLeft',
      }),
    []
  )
  const { t } = useTranslation()

  return (
    <nav className={`${expanded ? styles.expandleft : styles.retractleft}`}>
      <button
        onClick={toggleExpand}
        className={expanded ? styles.close : styles.open}
      >
        <Sidebar />
        {expanded
          ? t('write.sidebar.closeButton')
          : t('write.sidebar.biblioAndCoButton')}
      </button>
      {expanded && (
        <div>
          <ArticleVersions
            articleId={articleInfos._id}
            selectedVersion={selectedVersion}
            compareTo={compareTo}
            readOnly={readOnly}
          />
          <Sommaire />
        </div>
      )}
    </nav>
  )
}
