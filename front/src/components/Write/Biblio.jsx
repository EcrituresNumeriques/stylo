import React, { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight } from 'react-feather'

import Modal from '../Modal'
import Bibliographe from './bibliographe/Bibliographe'

import menuStyles from './menu.module.scss'
import styles from './biblio.module.scss'
import Button from '../Button'
import ReferenceList from './ReferenceList'

function Biblio ({ article, readOnly }) {
  const [expand, setExpand] = useState(true)
  const [modal, setModal] = useState(false)

  const openModal = useCallback(() => setModal(true), [])
  const closeModal = useCallback(() => setModal(false), [])

  return (
    <section className={[menuStyles.section, styles.section].join(' ')}>
      <h1 onClick={() => setExpand(!expand)}>
        {expand ? <ChevronDown/> : <ChevronRight/>} Bibliography
      </h1>
      {expand && (
        <>
          {!readOnly && (
            <Button className={styles.manageButton} onClick={openModal}>Manage Bibliography</Button>
          )}
          <ReferenceList />
        </>
      )}
      {modal && (
        <Modal cancel={closeModal}>
          <Bibliographe cancel={closeModal} article={article} />
        </Modal>
      )}
    </section>
  )
}

export default Biblio
