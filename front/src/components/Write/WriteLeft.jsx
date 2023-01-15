import React, { useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import styles from './writeLeft.module.scss'
import Stats from './Stats'
import Biblio from './Biblio'
import Sommaire from './Sommaire'
import Versions from './Versions'
import { Sidebar } from 'react-feather'

export default function WriteLeft ({ articleInfos, readOnly, compareTo, selectedVersion }) {
  const expanded = useSelector(state => state.articlePreferences.expandSidebarLeft)
  const articleStats = useSelector(state => state.articleStats, shallowEqual)
  const dispatch = useDispatch()
  const toggleExpand = useCallback(() => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandSidebarLeft' }), [])

  return (
    <nav className={`${expanded ? styles.expandleft : styles.retractleft}`}>
      <button onClick={toggleExpand} className={expanded ? styles.close : styles.open}>
        <Sidebar /> {expanded ? 'close' : 'Bibliography & co'}
      </button>
      {expanded && (<div>
        <header>
          <h1>Summary</h1>
        </header>
        <Versions
          article={articleInfos}
          selectedVersion={selectedVersion}
          compareTo={compareTo}
          readOnly={readOnly}
        />
        <Sommaire />
        <Biblio readOnly={readOnly} article={articleInfos} />
        <Stats stats={articleStats} />
      </div>)}
    </nav>
  )
}
