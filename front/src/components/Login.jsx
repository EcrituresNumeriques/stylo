import React, { useCallback, useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { applicationConfig } from '../config.js'
import { fromFormData } from '../helpers/forms.js'
import { useActiveUserId } from '../hooks/user.js'

import styles from './login.module.scss'
import buttonStyles from './button.module.scss'
import formStyles from './form.module.scss'
import Field from './Field'
import Button from './Button'
import { HelpCircle } from 'lucide-react'
import InlineAlert from './feedback/InlineAlert.jsx'

export default function Login() {
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const { replace, location } = useHistory()
  const userId = useActiveUserId()

  const setSessionToken = useCallback(
    (token) => dispatch({ type: 'UPDATE_SESSION_TOKEN', token }),
    []
  )

  const { backendEndpoint } = applicationConfig

  useEffect(() => {
    const authToken = new URLSearchParams(location.hash).get('#auth-token')

    if (authToken) {
      setSessionToken(authToken)
    }

    if (userId) {
      replace('/articles')
    }
  }, [userId])

  const handleSubmit = useCallback((event) => {
    event.preventDefault()
    const data = fromFormData(event.target)
    setError('')

    fetch(backendEndpoint + '/login/local', {
      method: 'POST',
      // this parameter enables the cookie directive (set-cookie)
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        return response.ok
          ? response.json()
          : Promise.reject(new Error('Email or password is incorrect'))
      })
      .then((data) => {
        dispatch({ type: 'LOGIN', ...data })
        replace('/articles')
      })
      .catch((error) => {
        setError(error.message)
      })
  }, [])

  return (
    <>
      <Helmet>
        <title>{t('credentials.login.confirmButton')}</title>
      </Helmet>

      <section className={styles.box}>
        <h1>{t('credentials.login.title')}</h1>

        <fieldset className={styles.section}>
          <legend>
            <h2 id="external-login">
              {t('credentials.login.withRemoteAccount')}
            </h2>
          </legend>

          <p>
            <a
              className={buttonStyles.loginLink}
              style={{ '--login-icon': 'url(/images/huma-num-logo.svg)' }}
              href={backendEndpoint + '/login/humanid'}
              lang="fr"
              aria-label={t('credentials.login.withService', {
                name: 'Huma-Num',
              })}
            >
              Huma-Num
            </a>
          </p>

          <p>
            <a
              className={buttonStyles.loginLink}
              style={{ '--login-icon': 'url(/images/hypothesis-logo.svg)' }}
              href={backendEndpoint + '/login/hypothesis'}
              lang="en"
              aria-label={t('credentials.login.withService', {
                name: 'Hypothesis',
              })}
            >
              Hypothesis
            </a>
          </p>

          <p>
            <a
              className={buttonStyles.loginLink}
              style={{ '--login-icon': 'url(/images/zotero-logo.svg)' }}
              href={backendEndpoint + '/login/zotero'}
              lang="en"
              aria-label={t('credentials.login.withService', {
                name: 'Zotero',
              })}
            >
              Zotero
            </a>
          </p>

          <p className={styles.help}>
            <HelpCircle size={18} className={styles.inlineIcon} aria-hidden />
            <a href="https://humanum.hypotheses.org/5754#content">
              {t('credentials.login.howto')}
            </a>
          </p>
        </fieldset>

        <fieldset className={styles.section}>
          <legend>
            <h2 id="local-login">{t('credentials.login.withLocalAccount')}</h2>
          </legend>

          <form
            onSubmit={handleSubmit}
            className={formStyles.form}
            aria-labelledby="local-login"
          >
            <Field
              label={t('user.account.username')}
              name="username"
              hasError={error !== ''}
              required={true}
              autoComplete="username"
            />
            <Field
              label={t('credentials.password.label')}
              name="password"
              hasError={error !== ''}
              required={true}
              type="password"
              autoComplete="current-password"
            />

            {error && <InlineAlert message={error} />}
            <ul className={styles.actions}>
              <li>
                <Link to="/register">
                  {t('credentials.login.registerLink')}
                </Link>
              </li>
              <li className={styles.actionsSubmit}>
                <Button primary={true} type="submit">
                  {t('credentials.login.confirmButton')}
                </Button>
              </li>
            </ul>
          </form>
        </fieldset>
      </section>
    </>
  )
}
