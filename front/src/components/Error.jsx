import { captureException } from '@sentry/react'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useRouteError } from 'react-router'

import styles from '../components/Error.module.scss'
import Loading from './molecules/Loading.jsx'

export default function Error () {
  // REMIND: can't use `Suspense` inside an ErrorBoundary component
  const { t, _, ready } = useTranslation('errors', { useSuspense: false })
  const error = useRouteError()
  useEffect(() => {
    captureException(error)
  }, [error])

  if (!ready) {
    return <Loading/>
  }

  if (error.status === 404) {
    return (
      <section className={styles.container}>
        <article className={styles.error}>
          <h2>{t('404.title')}</h2>
          <p>
            {t('404.message')} <code>{error.message}</code>.
          </p>
        </article>
      </section>
    )
  }

  const stacktrace = error.stack ?? error.stack
  if (isRouteErrorResponse(error) || Object.hasOwn(error, 'message')) {
    return (
      <section className={styles.container}>
        <article className={styles.error}>
          <h2>{t('title')}</h2>

          <p>
            {t('message')}
            <pre>
              {error.statusText
                ? `${error.status} ${error.statusText}`
                : error.message}
            </pre>
          </p>

          {stacktrace && (
            <details className={styles.stacktrace}>
                <pre>
                  <code>{stacktrace}</code>
                </pre>
            </details>
          )}
        </article>
      </section>
    )
  } else {
    return <h1>{t('unknown')}</h1>
  }
}
