import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useGraphQLClient } from '../helpers/graphQL.js'

import styles from './Write/write.module.scss'
import buttonStyles from './button.module.scss'
import * as queries from '../components/Credentials.graphql'

import Button from './Button.jsx'

export default function AuthCallbackPopup() {
  const { query } = useGraphQLClient()
  const { service } = useParams()
  const dispatch = useDispatch()
  const [errorCode, setErrorCode] = useState(null)
  const hasOpener = Boolean(window.opener)

  const { t } = useTranslation()

  const closePopup = useCallback(
    (authProviders) => {
      if (hasOpener && !errorCode) {
        window.opener.postMessage(JSON.stringify(authProviders))
      } else {
        window.close()
      }
    },
    [errorCode]
  )

  useEffect(() => {
    query({
      query: queries.setAuthTokenMutation,
      variables: { service },
      withCredentials: true,
    }).then(
      ({ setAuthToken }) => {
        dispatch({
          type: 'UPDATE_ACTIVE_USER_DETAILS',
          payload: setAuthToken.authProviders,
        })

        closePopup(setAuthToken.authProviders)
      },
      (error) =>
        setErrorCode(error.messages[0]?.extensions.type || error.message)
    )
  }, [])

  if (errorCode === null) {
    return null
  }

  return (
    <section className={styles.container}>
      <article className={styles.simplePage}>
        <h2>{t(`credentials.authentication.error.title`)}</h2>

        <p>
          {t('credentials.authentication.error.description', {
            service: `$t(credentials.authentication.service.${service})`,
            errorCode: errorCode,
          })}
        </p>

        <p>
          {hasOpener && (
            <Button onClick={closePopup}>
              {t('credentials.authentication.back')}
            </Button>
          )}
          {!hasOpener && (
            <Link to="/credentials" className={buttonStyles.secondary}>
              {t('credentials.authentication.back')}
            </Link>
          )}
        </p>
      </article>
    </section>
  )
}
