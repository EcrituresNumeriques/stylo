import React, { useCallback, useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

import styles from './login.module.scss'
import Field from './Field'
import Button from './Button'
import { HelpCircle } from 'react-feather'
import InlineAlert from './feedback/InlineAlert.jsx'

export default function Login() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const { replace, location } = useHistory()
  const setSessionToken = useCallback(
    (token) => dispatch({ type: 'UPDATE_SESSION_TOKEN', token }),
    []
  )
  const authToken = new URLSearchParams(location.hash).get('#auth-token')

  const backendEndpoint = useSelector(
    (state) => state.applicationConfig.backendEndpoint
  )
  const humanIdRegisterEndpoint = useSelector(
    (state) => state.applicationConfig.humanIdRegisterEndpoint
  )

  useEffect(() => {
    if (authToken) {
      setSessionToken(authToken)
      replace(location.pathname)
    }
  }, [authToken])

  const handleSubmit = useCallback(
    (event) => {
      setError('')
      event.preventDefault()

      fetch(backendEndpoint + '/login/local', {
        method: 'POST',
        // this parameter enables the cookie directive (set-cookie)
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
        .then((response) => {
          return response.ok
            ? response.json()
            : Promise.reject(new Error('Email or password is incorrect'))
        })
        .then((data) => dispatch({ type: 'LOGIN', ...data }))
        .catch((error) => {
          setError(error.message)
        })
    },
    [username, password]
  )

  return (
    <>
      <section className={styles.disclaimer}>
        <p>
          Looking for technical and editing support?
          <br />
          Join the{' '}
          <a
            href="https://ecrituresnumeriques.ca/en/2019/10/25/Stylo-technical-and-editing-support"
            target="_blank"
            rel="noreferrer"
          >
            weekly session
          </a>{' '}
          for Stylo users.
        </p>
      </section>

      <section className={styles.box}>
        <h1>Welcome to Stylo!</h1>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <fieldset>
            <legend>
              {t('credentials.login.withRemoteAccount')}{' '}
              <small>({t('credentials.login.recommendedMethod')})</small>
            </legend>

            <p className={styles.help}>
              <HelpCircle size={18} className={styles.inlineIcon} />
              <a href="https://humanum.hypotheses.org/5754#content">
                {t('credentials.login.howto')}
              </a>
            </p>

            <p>
              <a
                className={styles.humaNumConnectBtn}
                href={backendEndpoint + '/login/openid'}
              >
                {t('credentials.login.withService', { name: 'Huma-Num' })}
              </a>
              <a
                className={styles.humaNumCreateAccountBtn}
                href={humanIdRegisterEndpoint}
              >
                {t('credentials.login.registerWithService', {
                  name: 'Huma-Num',
                })}
              </a>
            </p>

            <p className={styles.help}>
              <HelpCircle size={18} className={styles.inlineIcon} />
              If you use the same email address for your{' '}
              <strong>existing</strong> Stylo account and for your Huma-Num
              account, the two accounts will be automatically merged.
            </p>
          </fieldset>

          <hr />

          <fieldset>
            <legend>{t('credentials.login.withLocalAccount')}</legend>

            <Field
              label={t('user.account.username')}
              id="username"
              hasError={error !== ''}
              required={true}
              autoFocus={true}
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
            />
            <Field
              label={t('credentials.password.placeholder')}
              id="password"
              hasError={error !== ''}
              required={true}
              type="password"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
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
          </fieldset>
        </form>
      </section>
    </>
  )
}
