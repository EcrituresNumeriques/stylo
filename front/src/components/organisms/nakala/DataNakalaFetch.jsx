import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '../../atoms/index.js'

import NakalaUserCollectionsCombobox from './NakalaUserCollectionsCombobox.jsx'

import styles from './DataNakalaFetch.module.scss'

export default function DataNakalaFetch({
  humanid,
  initialCollectionUri,
  onChange,
}) {
  const { t } = useTranslation('data', { useSuspense: false })
  const [collectionUri, setCollectionUri] = useState(initialCollectionUri)
  const handleCollectionChange = useCallback(
    (value) => setCollectionUri(value),
    [setCollectionUri]
  )
  return (
    <div className={styles.container}>
      {/* pour le moment, le scope share retourne aussi les collections dont l'utilisateur est propriétaire */}
      <NakalaUserCollectionsCombobox
        scope={'share'}
        value={collectionUri}
        humanid={humanid}
        onChange={handleCollectionChange}
      />
      <Button
        type="submit"
        primary
        disabled={!collectionUri}
        onClick={() => onChange(collectionUri)}
      >
        {t('actions.fetch.collection')}
      </Button>
    </div>
  )
}
