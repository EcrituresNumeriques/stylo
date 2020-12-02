import React from 'react'
import App from '../layouts/App'

import styles from '../components/Write/write.module.scss'

export default () => (
  <App layout="fullPage">
    <section className={styles.container}>
      <article className={styles.error}>
        <h2>Error 404</h2>

        <p>Page not found.</p>
      </article>
    </section>
  </App>
)
