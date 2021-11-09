import React, { useState } from 'react'
import { connect } from 'react-redux'
import { ChevronDown, ChevronRight } from 'react-feather'

import Modal from '../Modal'
import Reference from './Reference'
import Bibliographe from './bibliographe/Bibliographe'

import menuStyles from './menu.module.scss'
import styles from './biblio.module.scss'
import Button from '../Button'
import ReferenceList from './ReferenceList'

function Biblio ({ article, readOnly, articleBibTeXEntries }) {
  const [expand, setExpand] = useState(true)
  const [modal, setModal] = useState(false)

  return (
    <section className={[menuStyles.section, styles.section].join(' ')}>
      <h1 onClick={() => setExpand(!expand)}>
        {expand ? <ChevronDown/> : <ChevronRight/>} Bibliography
      </h1>
      {expand && (
        <>
          {!readOnly && (
            <Button className={styles.manageButton} onClick={() => setModal(true)}>Manage Bibliography</Button>
          )}
          <ReferenceList />
        </>
      )}
      {modal && (
        <Modal cancel={() => setModal(false)} withCancelButton={false}>
          <Bibliographe
            cancel={() => setModal(false)}
            article={article}
          />
        </Modal>
      )}
    </section>
  )
}

const mapStateToProps = ({ articleBibTeXEntries }) => {
  return { articleBibTeXEntries }
}

const ConnectedBiblio = connect(mapStateToProps)(Biblio)
export default ConnectedBiblio
