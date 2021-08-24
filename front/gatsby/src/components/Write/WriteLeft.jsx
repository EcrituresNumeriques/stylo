import React, { useState } from 'react'
import { connect } from 'react-redux'

import styles from './writeLeft.module.scss'
import Stats from './Stats'
import Biblio from './Biblio'
import Sommaire from './Sommaire'
import Versions from './Versions'

const mapStateToProps = ({ articleStats }) => ({ articleStats })

function WriteLeft ({ bib, article, md, articleStats, readOnly, versions, version, revision, compareTo, versionId, selectedVersion, sendVersion, onTableOfContentClick }) {
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
          <header>
            <h1>{article.title}</h1>
            <h2>by {article.owners.join(', ')}</h2>
          </header>
          <Versions
            article={article}
            versions={versions}
            readOnly={readOnly}
            version={version}
            revision={revision}
            versionId={versionId}
            sendVersion={sendVersion}
            selectedVersion={selectedVersion}
            compareTo={compareTo}
          />
          <Sommaire md={md} onTableOfContentClick={onTableOfContentClick} />
          <Biblio readOnly={readOnly} bib={bib} article={article} />
          <Stats stats={articleStats} />
        </div>
      )}
    </nav>
  )
}

export default connect(mapStateToProps)(WriteLeft)
