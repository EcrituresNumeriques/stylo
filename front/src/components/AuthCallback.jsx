import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import styles from './Write/write.module.scss'

import Button from './Button.jsx'

export default function AuthCallbackPopup() {
  const location = useLocation()
  const { service } = useParams()
  const [authParams, setAuthParams] = useState({})

  const { t } = useTranslation()
  const saveCredentials = useCallback(({ service, token, type }) => {
    if (type === 'success') {
      window.opener.postMessage(
        JSON.stringify({
          type: 'SET_AUTH_TOKEN',
          service,
          token,
        })
      )
    }
  }, [])

  const closePopup = useCallback(() => window.close(), [])

  useEffect(() => {
    const {
      token,
      type = 'success',
      message = '',
    } = Object.fromEntries(
      new URLSearchParams(location.hash.slice(1)).entries()
    )

    setAuthParams({ service, token, type, message })
    saveCredentials({ service, token, type, message })
  }, [])

  return (
    <section className={styles.container}>
      <article className={styles.error}>
        <h2>{t(`credentials.authentication.${authParams.type}.title`)}</h2>

        {authParams.service && (
          <p>
            {t(`credentials.authentication.${authParams.type}.description`, {
              service: authParams.service,
              message: authParams.message,
            })}
          </p>
        )}

        <p>
          <Button onClick={closePopup} disabled={!authParams.type}>
            {t('credentials.authentication.back')}
          </Button>
        </p>
      </article>
    </section>
  )
}
