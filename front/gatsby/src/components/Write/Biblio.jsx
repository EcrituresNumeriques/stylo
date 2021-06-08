import React, { useState } from 'react'
import { connect } from 'react-redux'
import { ChevronDown, ChevronRight } from 'react-feather'

import menuStyles from './menu.module.scss'
import styles from './biblio.module.scss'

import Modal from '../Modal'
import ListCitation from '../Citation/ListCitation'
import Bibliographe from './bibliographe/Bibliographe'
import Button from '../Button'

import { getUserProfile } from '../../helpers/userProfile'

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
          <ListCitation bibTeXEntries={articleBibTeXEntries} canCopy={true}/>
        </>
      )}
      {modal && (
        <Modal cancel={() => setModal(false)}>
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
