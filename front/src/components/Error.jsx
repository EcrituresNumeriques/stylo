import React from 'react'
import App from '../layouts/App'

import styles from './Error.module.scss'

export default function Error() {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const message = urlSearchParams.get('message') || ''
  return (
    <App layout="fullPage">
      <section className={styles.container}>
        <article className={styles.error}>
          <h2>Error</h2>

          <p>
            Something wrong happened: <code>{message}</code>
          </p>
        </article>
      </section>
    </App>
  )
}
