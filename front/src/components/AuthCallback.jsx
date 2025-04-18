import React, { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import styles from './Page.module.scss'
import buttonStyles from './button.module.scss'

import Button from './Button.jsx'

const ENABLED_SERVICES = ['zotero']

export default function AuthCallbackPopup() {
  const location = useLocation()
  const { service } = useParams()
  const [authParams, setAuthParams] = useState({})
  const hasOpener = Boolean(window.opener)

  const { t } = useTranslation()
  const saveCredentials = useCallback(({ service, token, type }) => {
    if (type === 'success' && hasOpener) {
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
    let translationKey = 'description'

    let {
      token,
      type = 'success',
      message = '',
    } = Object.fromEntries(
      new URLSearchParams(location.hash.slice(1)).entries()
    )

    if (!ENABLED_SERVICES.includes(service)) {
      type = 'error'
      translationKey = 'unknownService'
    } else if (!token && !message) {
      type = 'error'
      translationKey = 'noToken'
    }

    setAuthParams({ service, token, type, message, translationKey })
    saveCredentials({ service, token, type, message })
  }, [])

  return (
    <section className={styles.container}>
      <article className={styles.simplePage}>
        <h2>{t(`credentials.authentication.${authParams.type}.title`)}</h2>

        <p>
          {t(
            `credentials.authentication.${authParams.type}.${authParams.translationKey}`,
            {
              service: authParams.service,
              message: authParams.message,
            }
          )}
        </p>

        <p>
          {hasOpener && (
            <Button onClick={closePopup} disabled={!authParams.type}>
              {t('credentials.authentication.back')}
            </Button>
          )}
          {!hasOpener && (
            <Link to="/" className={buttonStyles.secondary}>
              {t('credentials.authentication.back')}
            </Link>
          )}
        </p>
      </article>
    </section>
  )
}
