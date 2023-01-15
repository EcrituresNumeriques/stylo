import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ChevronDown, ChevronRight } from 'react-feather'

import Modal from '../Modal'
import Bibliographe from './bibliographe/Bibliographe'

import menuStyles from './menu.module.scss'
import styles from './biblio.module.scss'
import Button from '../Button'
import ReferenceList from './ReferenceList'

function Biblio ({ article, readOnly }) {
  const expand = useSelector(state => state.articlePreferences.expandBiblio)
  const dispatch = useDispatch()
  const toggleExpand = useCallback(() => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandBiblio' }), [])

  const [modal, setModal] = useState(false)
  const openModal = useCallback(() => setModal(true), [])
  const closeModal = useCallback(() => setModal(false), [])

  return (
    <section className={[menuStyles.section, styles.section].join(' ')}>
      <h1 onClick={toggleExpand}>
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
        <Modal title="Bibliography Manager" cancel={closeModal}>
          <Bibliographe cancel={closeModal} article={article} />
        </Modal>
      )}
    </section>
  )
}

export default Biblio
