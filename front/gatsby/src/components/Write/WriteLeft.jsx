import React, { useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import styles from './writeLeft.module.scss'
import Stats from './Stats'
import Biblio from './Biblio'
import Sommaire from './Sommaire'
import Versions from './Versions'
import WorkingVersion from './WorkingVersion'

function WriteLeft ({ article, readOnly, compareTo, selectedVersion, onTableOfContentClick }) {
  const expanded = useSelector(state => state.articlePreferences.expandSidebarLeft)
  const articleStats = useSelector(state => state.articleStats, shallowEqual)
  const dispatch = useDispatch()
  const toggleExpand = useCallback(() => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandSidebarLeft' }), [])

  return (
    <nav className={`${expanded ? styles.expandleft : styles.retractleft}`}>
      <nav
        onClick={toggleExpand}
        className={expanded ? styles.close : styles.open}
      >
        {expanded ? 'close' : 'open'}
      </nav>
      {expanded && (
        <div>
          <WorkingVersion
            articleTitle={article.title}
            articleOwners={article.owners}
            articleId={article._id}
            readOnly={readOnly}
          />
          <Versions
            article={article}
            selectedVersion={selectedVersion}
            compareTo={compareTo}
          />
          <Sommaire onTableOfContentClick={onTableOfContentClick} />
          <Biblio readOnly={readOnly} article={article} />
          <Stats stats={articleStats} />
        </div>
      )}
    </nav>
  )
}

export default WriteLeft
