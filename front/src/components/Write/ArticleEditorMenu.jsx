import React, { useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import styles from './articleEditorMenu.module.scss'
import Stats from './Stats'
import Biblio from './Biblio'
import Versions from './Versions'
import { Sidebar } from 'react-feather'

export default function ArticleEditorMenu ({ articleInfos, readOnly, compareTo, selectedVersion }) {
  const expanded = useSelector(state => state.articlePreferences.expandSidebarLeft)
  const articleStats = useSelector(state => state.articleStats, shallowEqual)
  const dispatch = useDispatch()
  const toggleExpand = useCallback(() => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandSidebarLeft' }), [])
  const { t } = useTranslation()

  return (
    <nav className={`${expanded ? styles.expandleft : styles.retractleft}`}>
      <button onClick={toggleExpand} className={expanded ? styles.close : styles.open}>
        <Sidebar /> {expanded ? t('write.sidebar.closeButton') : t('write.sidebar.biblioAndCoButton')}
      </button>
      {expanded && (<div>
        <Versions
          article={articleInfos}
          selectedVersion={selectedVersion}
          compareTo={compareTo}
          readOnly={readOnly}
        />
        <Biblio readOnly={readOnly} article={articleInfos} />
        <Stats stats={articleStats} />
      </div>)}
    </nav>
  )
}
