import React, { useState } from 'react'
import { connect } from 'react-redux'

import styles from './writeLeft.module.scss'
import Stats from './Stats'
import Biblio from './Biblio'
import Sommaire from './Sommaire'
import Versions from './Versions'
import WorkingVersion from './WorkingVersion'

const mapStateToProps = ({ articleStats }) => ({ articleStats })

function WriteLeft ({ article, articleStats, readOnly, compareTo, selectedVersion, onTableOfContentClick }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <nav className={`${expanded ? styles.expandleft : styles.retractleft}`}>
      <nav
        onClick={() => setExpanded(!expanded)}
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
            articleVersionId="latest"
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

export default connect(mapStateToProps)(WriteLeft)
