import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'

import { useModal } from '../../../hooks/modal.js'
import { Button } from '../../atoms/index.js'

import Modal from '../../molecules/Modal.jsx'
import DataNakalaFetch from './DataNakalaFetch.jsx'
import NakalaRecords from './NakalaRecords.jsx'

import styles from './ArticleData.module.scss'

export default function ArticleData({}) {
  const { user } = useRouteLoaderData('app')
  console.log({ user })
  const { t } = useTranslation('data', { useSuspense: false })
  const nakalaModal = useModal()
  const [collection, setCollection] = useState('')
  const handleCollectionChange = useCallback(
    (value) => {
      nakalaModal.close()
      setCollection(value)
    },
    [setCollection, nakalaModal]
  )

  return (
    <section>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('title')}</h2>
      </header>
      <section>
        <div className={styles.headingActions}>
          <Button small={true} onClick={() => nakalaModal.show()}>
            {t('actions.fetch.label')}
          </Button>
        </div>
        <NakalaRecords collection={collection} />
        <Modal {...nakalaModal.bindings} title={t('actions.fetch.label')}>
          <DataNakalaFetch onChange={handleCollectionChange} />
        </Modal>
      </section>
    </section>
  )
}
