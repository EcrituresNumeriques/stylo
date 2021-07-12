import React, { useState, useMemo } from 'react'
import { connect } from 'react-redux'

import Stats from './Stats'
import Biblio from './Biblio'
import Sommaire from './Sommaire'
import Versions from './Versions'
import bib2key from './bibliographe/CitationsFilter'

import styles from './writeLeft.module.scss'

const mapStateToProps = ({ articleStats }) => ({ articleStats })

function WriteLeft (props) {
  const bibTeXEntries = useMemo(() => bib2key(props.bib), [props.bib])
  return (
    <>
      <header className={styles.documentMenuHeader}>
        <h1>{props.article.title}</h1>
        <h2>by {props.article.owners.join(', ')}</h2>
      </header>
      <Versions {...props} />
      <Sommaire md={props.md} setCodeMirrorCursor={props.setCodeMirrorCursor} />
      <Biblio bibTeXEntries={bibTeXEntries} readOnly={props.readOnly} bib={props.bib} handleBib={props.handleBib} article={props.article} />
      <Stats stats={props.articleStats} />
    </>
  )
}

export default connect(mapStateToProps)(WriteLeft)
