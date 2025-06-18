import { captureException } from '@sentry/react'

import React, { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useRouteError } from 'react-router'

import Loading from './molecules/Loading.jsx'

import styles from '../components/AppError.module.scss'

export default function AppError() {
  // REMIND: can't use `Suspense` inside an ErrorBoundary component
  const { t, _, ready } = useTranslation('errors', { useSuspense: false })
  const error = useRouteError()

  useEffect(() => {
    captureException(error)
  }, [error])

  if (!ready) {
    return <Loading />
  }

  const content =
    isRouteErrorResponse(error) || error instanceof Error ? (
      <>
        <h2>{t('title', { status: error.status })}</h2>
        <p>{error.message || t('unknown')}</p>
        {error.data && (
          <p>
            <Trans i18nKey="code" values={{ code: error.data }} t={t}>
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
      </>
    ) : (
      <h1>{t('unknown')}</h1>
    )

  return (
    <section className={styles.container}>
      <article className={styles.error}>{content}</article>
    </section>
  )
}
