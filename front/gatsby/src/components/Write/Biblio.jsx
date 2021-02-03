import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'react-feather'

import Modal from '../Modal'
import Reference from './Reference'
import Bibliographe from './bibliographe/Bibliographe'

import styles from './biblio.module.scss'
import Button from '../Button'

export default (props) => {
  const [expand, setExpand] = useState(true)
  const [modal, setModal] = useState(false)

  return (
    <section id={styles.section}>
      <h1
        className={expand ? null : styles.closed}
        onClick={() => setExpand(!expand)}
      >
        {expand ? <ChevronDown/> : <ChevronRight/>} Bibliography
      </h1>
      {expand && (
        <>
          {!props.readOnly && (
            <Button onClick={() => setModal(true)}>Manage Bibliography</Button>
          )}
          {props.bibTeXEntries.map((entry, index) => (
            <Reference key={`ref-${entry.key}-${index}`} entry={entry} />
          ))}
        </>
      )}
      {modal && (
        <Modal cancel={() => setModal(false)}>
          <Bibliographe
            bib={props.bib}
            success={props.handleBib}
            cancel={() => setModal(false)}
            article={props.article}
          />
        </Modal>
      )}
    </section>
  )
}
