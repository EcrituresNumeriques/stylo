import React from 'react'
import { Helmet } from 'react-helmet-async'

import { PageTitle } from '../atoms/index.js'

import NakalaRecords from '../organisms/nakala/NakalaRecords.jsx'

import styles from './Nakala.module.scss'

export default function Nakala() {
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
        <NakalaRecords />
      </section>
    </div>
  )
}
