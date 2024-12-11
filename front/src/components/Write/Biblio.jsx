import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { ChevronDown, ChevronRight } from 'react-feather'

import Modal from '../Modal'
import Bibliographe from './bibliographe/Bibliographe'

import menuStyles from './menu.module.scss'
import styles from './biblio.module.scss'
import Button from '../Button'
import ReferenceList from './ReferenceList'

function Biblio({ article, readOnly }) {
  const expand = useSelector((state) => state.articlePreferences.expandBiblio)
  const dispatch = useDispatch()
  const toggleExpand = useCallback(
    () => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandBiblio' }),
    []
  )

  const [modal, setModal] = useState(false)
  const openModal = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    setModal(true)
  }, [])
  const closeModal = useCallback(() => setModal(false), [])
  const { t } = useTranslation()

  return (
    <section className={[menuStyles.section, styles.section].join(' ')}>
      <h1 onClick={toggleExpand}>
        {expand ? <ChevronDown /> : <ChevronRight />}{' '}
        {t('write.sidebar.biblioTitle')}
        <Button
          className={styles.headingAction}
          small={true}
          disabled={readOnly}
          onClick={openModal}
        >
          {t('write.sidebar.manageButton')}
        </Button>
      </h1>
      {expand && <ReferenceList />}
      {modal && (
        <Modal title={t('write.biblioModal.title')} cancel={closeModal}>
          <Bibliographe cancel={closeModal} article={article} />
        </Modal>
      )}
    </section>
  )
}

export default Biblio
