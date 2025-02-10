import React, { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { applicationConfig } from '../config.js'

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
  const navigate = useNavigate()
  const { backendEndpoint, humanIdRegisterEndpoint } = applicationConfig

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
        .then((data) => {
          dispatch({ type: 'LOGIN', ...data })
          navigate('/articles')
        })
        .catch((error) => {
          setError(error.message)
        })
    },
    [username, password]
  )

  return (
    <>
      <Helmet>
        <title>{t('credentials.login.confirmButton')}</title>
      </Helmet>
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
              Connect with a Huma-Num account <small>(recommended)</small>
            </legend>

            <p className={styles.help}>
              <HelpCircle size={18} className={styles.inlineIcon} />
              <a href="https://humanum.hypotheses.org/5754#content">
                How does it work?
              </a>
            </p>

            <p>
              <a
                className={styles.humaNumConnectBtn}
                href={backendEndpoint + '/login/openid'}
              >
                Connect with Huma-Num
              </a>
              <a
                className={styles.humaNumCreateAccountBtn}
                href={humanIdRegisterEndpoint}
              >
                Create a Huma-Num account
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
            <legend>Connect with a local Stylo account</legend>

            <Field
              label="Username"
              id="username"
              hasError={error !== ''}
              required={true}
              autoFocus={true}
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
            />
            <Field
              label="Password"
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
                <Link to="/register">Create an account</Link>
              </li>
              <li className={styles.actionsSubmit}>
                <Button primary={true} type="submit">
                  Login
                </Button>
              </li>
            </ul>
          </fieldset>
        </form>
      </section>
    </>
  )
}
