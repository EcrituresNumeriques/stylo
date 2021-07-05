import React, { useState, useMemo } from 'react'
import { connect } from 'react-redux'

import styles from './writeLeft.module.scss'
import Stats from './Stats'
import Biblio from './Biblio'
import Sommaire from './Sommaire'
import Versions from './Versions'
import bib2key from './bibliographe/CitationsFilter'

const mapStateToProps = ({ articleStats }) => ({ articleStats })

function WriteLeft ({ bib, article, md, articleStats, readOnly, handleBib, versions, version, revision, compareTo, versionId, selectedVersion, sendVersion, onTableOfContentClick }) {
  const bibTeXEntries = useMemo(() => bib2key(bib), [bib])
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
          <Biblio bibTeXEntries={bibTeXEntries} readOnly={readOnly} bib={bib} handleBib={handleBib} article={article} />
          <Stats stats={articleStats} />
        </div>
      )}
    </nav>
  )
}

export default connect(mapStateToProps)(WriteLeft)
