import React from 'react'

import styles from '../components/Write/write.module.scss'
import Loading from './molecules/Loading.jsx'

export default function LoadingPage() {
  return (
    <section className={styles.container}>
      <article className={styles.simplePage}>
        <Loading />
      </article>
    </section>
  )
}
