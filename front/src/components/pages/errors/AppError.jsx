import { captureException } from '@sentry/react'

import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useRouteError } from 'react-router'

import { GraphQLError } from '../../../helpers/graphQL.js'
import { Loading } from '../../molecules/index.js'

import Unauthorized from './401.jsx'

import styles from './AppError.module.scss'

export default function AppError() {
  const error = useRouteError()

  useEffect(() => {
    if (!isExpectedError(error)) {
      captureException(error)
    }
  }, [error])

  return (
    <section className={styles.container}>
      <article className={styles.error}>{getErrorContent(error)}</article>
    </section>
  )
}

/**
 * Errors that are part of the normal flow and should not be reported to Sentry.
 * @param {unknown} error
 * @returns {boolean}
 */
function isExpectedError(error) {
  // responses thrown on purpose by route loaders (invalid article id, article not found)
  if (isRouteErrorResponse(error) && [400, 404].includes(error.status)) {
    return true
  }
  // user is not logged in or session has expired
  return error instanceof GraphQLError && error.code === 'UNAUTHENTICATED'
}

function getErrorContent(error) {
  // REMIND: can't use `Suspense` inside an ErrorBoundary component
  const { t, ready } = useTranslation('errors', { useSuspense: false })
  if (!ready) {
    return <Loading />
  }
  if (error.status === 401) {
    return <Unauthorized />
  }
  if (isRouteErrorResponse(error) || error instanceof Error) {
    return (
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
    )
  }
  return <h1>{t('unknown')}</h1>
}
