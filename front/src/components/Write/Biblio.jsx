import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { ChevronDown, ChevronRight } from 'react-feather'
import { useModal } from '../../hooks/modal.js'

import Modal from '../Modal'
import Bibliographe from './bibliographe/Bibliographe'

import menuStyles from './menu.module.scss'
import styles from './biblio.module.scss'
import Button from '../Button'
import ReferenceList from './ReferenceList'

function Biblio({ article, readOnly }) {
  const expand = useSelector((state) => state.articlePreferences.expandBiblio)
  const dispatch = useDispatch()
  const modal = useModal()
  const toggleExpand = useCallback(
    () => dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'expandBiblio' }),
    []
  )

  const { t } = useTranslation()

  return (
    <section className={[menuStyles.section, styles.section].join(' ')}>
      <h1 onClick={toggleExpand}>
        {expand ? <ChevronDown /> : <ChevronRight />}
        {t('write.sidebar.biblioTitle')}
        <Button
          className={styles.headingAction}
          small={true}
          disabled={readOnly}
          onClick={(event) => {
            event.stopPropagation()
            event.preventDefault()
            modal.show()
          }}
        >
          {t('write.sidebar.manageButton')}
        </Button>
      </h1>
      {expand && <ReferenceList />}
      <Modal {...modal.bindings} title={t('write.biblioModal.title')}>
        <Bibliographe cancel={() => modal.close()} article={article} />
      </Modal>
    </section>
  )
}

export default Biblio
