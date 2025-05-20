import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useRouteError } from 'react-router'

import { captureException } from '@sentry/react'

import styles from '../components/Error.module.scss'

export default function Error() {
  const error = useRouteError()
  const { t } = useTranslation('errors')

  useEffect(() => {
    captureException(error)
  }, [error])

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

  if (isRouteErrorResponse(error) || Object.hasOwn(error, 'message')) {
    return (
      <section className={styles.container}>
        <article className={styles.error}>
          <h2>{t('title')}</h2>

          <p>
            {t('message')}
            <q>
              {error.statusText
                ? `${error.status} ${error.statusText}`
                : error.message}
            </q>
          </p>

          {error.stack ||
            (error.data && (
              <details>
                <pre>
                  <code>{error.stack ?? error.data}</code>
                </pre>
              </details>
            ))}
        </article>
      </section>
    )
  } else {
    return <h1>{t('unknown')}</h1>
  }
}
