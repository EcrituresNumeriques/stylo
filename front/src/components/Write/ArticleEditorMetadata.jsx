import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Sidebar } from 'lucide-react'

import styles from './articleEditorMetadata.module.scss'
import ArticleMetadata from './ArticleMetadata.jsx'

/**
 * @param {object} props
 * @param {(object) => void} props.onChange
 * @param {boolean} props.readOnly
 * @param {object} props.metadata
 * @returns {Element}
 */
export default function ArticleEditorMetadata({
  onChange,
  readOnly,
  metadata,
}) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const expanded = useSelector(
    (state) => state.articlePreferences.expandSidebarRight
  )

  const toggleExpand = useCallback(
    () =>
      dispatch({
        type: 'ARTICLE_PREFERENCES_TOGGLE',
        key: 'expandSidebarRight',
      }),
    []
  )

  return (
    <nav className={`${expanded ? styles.expandRight : styles.retractRight}`}>
      <button
        onClick={toggleExpand}
        className={expanded ? styles.close : styles.open}
      >
        <Sidebar />
        {expanded
          ? t('write.sidebar.closeButton')
          : t('write.sidebar.metadataButton')}
      </button>
      {expanded && (
        <ArticleMetadata
          metadata={metadata}
          onChange={onChange}
          readOnly={readOnly}
        />
      )}
    </nav>
  )
}
