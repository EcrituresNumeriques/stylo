import React, { useCallback, useState } from 'react'
import { Helmet } from 'react-helmet-async'

import { PageTitle } from '../atoms/index.js'

import NakalaRecords from '../organisms/nakala/NakalaRecords.jsx'
import NakalaUserCollectionsCombobox from '../organisms/nakala/NakalaUserCollectionsCombobox.jsx'

import styles from './Nakala.module.scss'

export default function Nakala() {
  const [collection, setCollection] = useState('')
  const handleCollectionChange = useCallback(
    (value) => {
      console.log(`collection changed: ${value}`)
      setCollection(value)
    },
    [setCollection]
  )

  return (
    <div className={styles.section}>
      <Helmet>
        <title>Nakala: Prototype</title>
      </Helmet>

      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <PageTitle title="Nakala" />
        </div>
      </header>
      <section role="list">
        <NakalaUserCollectionsCombobox onChange={handleCollectionChange} />

        <NakalaRecords collection={collection} />
      </section>
    </div>
  )
}
