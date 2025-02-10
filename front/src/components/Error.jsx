import React, { useEffect } from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router'
import { captureException } from '@sentry/react'

import styles from '../components/Write/write.module.scss'
import { useTranslation } from 'react-i18next'

export default function Error() {
  const error = useRouteError()
  const { t } = useTranslation()
  useEffect(() => {
    captureException(error)
  }, [error])

  if (isRouteErrorResponse(error) || Object.hasOwn(error, 'message')) {
    return (
      <section className={styles.container}>
        <article className={styles.error}>
          <h2>{t('error.title')}</h2>

          <p>
            {t('error.message')}
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
    return <h1>{t('error.unknown')}</h1>
  }
}
