import React from 'react'
import App from '../layouts/App'

import styles from '../components/Write/write.module.scss'

export default () => {
  let error = ""
  let errorDescription = ""

  if (typeof window !== 'undefined') {
    // see https://www.oauth.com/oauth2-servers/authorization/the-authorization-response/
    const params = new URLSearchParams(document.location.search)
    error = params.get('error')
    errorDescription = params.get('error_description')
  }

  return (
    <App layout="fullPage">
      <section className={styles.container}>
        <article className={styles.error}>
          <h2>Authentication Error</h2>

          <p>The authentication process could not go through{!errorDescription && `, and it's not clear why`}.</p>

          {errorDescription && <p>{ errorDescription }</p>}

          {error && <code>{error}</code>}
        </article>
      </section>
    </App>
  )
}
