import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

import env from '../helpers/env'
import styles from './login.module.scss'
import Field from './Field'
import Button from './Button'
import { HelpCircle } from 'react-feather'

const mapStateToProps = ({ activeUser }) => {
  return { activeUser }
}

const mapDispatchToProps = (dispatch) => {
  return {
    login: (data) => dispatch({ type: 'LOGIN', login: data }),
    logout: () => dispatch({ type: 'LOGOUT' }),
  }
}

function Login ({ login, applicationConfig }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    fetch(env.BACKEND_ENDPOINT + '/login', {
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
      .then(login)
      .catch((error) => {
        console.error(error)
        alert(error)
      })
  }

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
          >
            weekly session
          </a>{' '}
          for Stylo users.
        </p>
      </section>

      {applicationConfig && (
        <section className={styles.box}>
          <h1 className={styles.loginTitle}>Welcome to Stylo!</h1>
          <form onSubmit={(event) => handleSubmit(event, applicationConfig)}>
            <fieldset>
              <legend>
                Connect via Huma-Num <small>(recommended)</small>
              </legend>
              <p className={styles.help}>
                <HelpCircle size={18} className={styles.inlineIcon} />
                <a href="https://humanum.hypotheses.org/5754#content">What is HumanID?</a>
              </p>

              <p>
                <a
                  className={styles.humaNumConnectBtn}
                  href={applicationConfig.backendEndpoint + '/login/openid'}
                >
                  Connect with Huma-Num
                </a>
                <a
                  className={styles.humaNumCreateAccountBtn}
                  href={applicationConfig.humanIdRegisterEndpoint}
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

              <Field label="Username" id="username" required={true} autoComplete="username" onChange={event => setUsername(event.target.value)} />
              <Field label="Password" id="password" required={true} type="password" autoComplete="current-password" onChange={event => setPassword(event.target.value)} />

              <ul className={styles.actions}>
                <li>
                  <Link to="/register">Create an account</Link>
                </li>
                <li className={styles.actionsSubmit}>
                  <Button primary={true} type="submit">Login</Button>
                </li>
              </ul>
            </fieldset>
          </form>
        </section>
      )}
    </>
  )
}

const ConnectedLogin = connect(mapStateToProps, mapDispatchToProps)(Login)

export default ConnectedLogin
