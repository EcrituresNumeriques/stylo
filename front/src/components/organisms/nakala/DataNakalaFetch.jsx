import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../atoms/index.js'

import NakalaUserCollectionsCombobox from './NakalaUserCollectionsCombobox.jsx'

import styles from './DataNakalaFetch.module.scss'

export default function DataNakalaFetch({ onChange }) {
  const { t } = useTranslation('data', { useSuspense: false })
  const [collectionIdentifier, setCollectionIdentifier] = useState('')
  const handleCollectionChange = useCallback(
    (value) => setCollectionIdentifier(value),
    [setCollectionIdentifier]
  )
  return (
    <div className={styles.container}>
      <NakalaUserCollectionsCombobox onChange={handleCollectionChange} />
      <Button
        type="submit"
        primary
        disabled={collectionIdentifier === ''}
        onClick={() => onChange(collectionIdentifier)}
      >
        {t('actions.fetch.collection')}
      </Button>
    </div>
  )
}
