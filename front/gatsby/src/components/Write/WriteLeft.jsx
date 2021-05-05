import React, { useState, useMemo } from 'react'
import { connect } from 'react-redux'

import styles from './writeLeft.module.scss'
import Stats from './Stats'
import Biblio from './Biblio'
import Sommaire from './Sommaire'
import Versions from './Versions'
import bib2key from './bibliographe/CitationsFilter'

const mapStateToProps = ({ articleStats }) => ({ articleStats })

function WriteLeft (props) {
  const bibTeXEntries = useMemo(() => bib2key(props.bib), [props.bib])
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
            <h1>{props.article.title}</h1>
            <h2>by {props.article.owners.join(', ')}</h2>
          </header>
          <Versions {...props} />
          <Sommaire md={props.md} setCodeMirrorCursor={props.setCodeMirrorCursor} />
          <Biblio bibTeXEntries={bibTeXEntries} readOnly={props.readOnly} bib={props.bib} handleBib={props.handleBib} article={props.article} />
          <Stats stats={props.articleStats} />
        </div>
      )}
    </nav>
  )
}

export default connect(mapStateToProps)(WriteLeft)
