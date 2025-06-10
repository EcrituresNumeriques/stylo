import { captureException } from '@sentry/react'
import React, { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
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

  if (isRouteErrorResponse(error) || Object.hasOwn(error, 'message')) {
    return (
      <section className={styles.container}>
        <article className={styles.error}>
          <h2>{t('title', { status: error.status })}</h2>

          <p>
            {error.statusText || error.message}
          </p>

          {error.data && (
            <p>
              <Trans i18nKey="code" values={{code: error.data}} t={t}>
                <strong>Code</strong> {error.data}
              </Trans>
            </p>
          )}

          {error.stack && (
            <details>
              <pre>
                <code>{error.stack}</code>
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
