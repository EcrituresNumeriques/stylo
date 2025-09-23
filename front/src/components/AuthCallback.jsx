import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { useGraphQLClient } from '../helpers/graphQL.js'

import Button from './Button.jsx'

import * as queries from '../components/Credentials.graphql'

import styles from './Page.module.scss'
import buttonStyles from './button.module.scss'

export default function AuthCallbackPopup() {
  const { query } = useGraphQLClient()
  const { service } = useParams()
  const [errorCode, setErrorCode] = useState(null)
  const hasOpener = Boolean(window.opener)

  const { t } = useTranslation()
  const { t: tError } = useTranslation('errors')

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
    /**
     * @param {ErrorResponse|GraphQLError} error
     */
    function onError(error) {
      console.log({ error })
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors.at(0)
        setErrorCode(firstError.extensions?.type || firstError.message)
      } else if (error.statusText) {
        setErrorCode(error.statusText)
      } else {
        setErrorCode(error.message || tError('unknown'))
      }
    }

    query({
      query: queries.setAuthTokenMutation,
      variables: { service },
      withCredentials: true,
    }).then(({ setAuthToken }) => {
      // FIXME: update authProviders using SWR ?
      /*dispatch({
        type: 'UPDATE_ACTIVE_USER_DETAILS',
        payload: setAuthToken.authProviders,
      })*/

      closePopup(setAuthToken.authProviders)
    }, onError)
  }, [])

  if (errorCode === null) {
    return null
  }

  return (
    <section className={styles.container}>
      <article
        className={styles.simplePage}
        aria-labelledby="credentials-authentication-error-title"
        aria-describedby="credentials-authentication-error-description"
      >
        <h2 id="credentials-authentication-error-title">
          {t(`credentials.authentication.error.title`)}
        </h2>

        <p id="credentials-authentication-error-description">
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
