import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import askGraphQL from '../helpers/graphQL'
import styles from './credentials.module.scss'
import CredentialsUserSelect from './CredentialsUserSelect'
import Loading from "./Loading";
import Button from "./Button";
import Field from "./Field";

const mapStateToProps = ({
  users,
  activeUser,
  sessionToken,
  password,
  applicationConfig,
}) => {
  return { users, activeUser, sessionToken, password, applicationConfig }
}
const mapDispatchToProps = (dispatch) => {
  return {
    switchUser: (u) => dispatch({ type: `SWITCH`, payload: u }),
    updateUser: (u) => dispatch({ type: 'RELOAD_USERS', payload: u }),
  }
}

const Credentials = (props) => {
  useEffect(() => {
    const query = `query{ refreshToken { users { _id displayName email } }}`
    askGraphQL({ query }, 'update Password', props.sessionToken, props.applicationConfig).then(data => {
      props.updateUser(data.refreshToken.users)
      setIsLoading(false)
    })
  }, [])

  const [password, setPassword] = useState('')
  const [passwordO, setPasswordO] = useState('')
  const [passwordC, setPasswordC] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const changePassword = async (e) => {
    e.preventDefault()
    try {
      setIsUpdating(true)
      const query = `mutation($password:ID!, $old:String!, $new:String!, $user:ID!){ changePassword(password:$password,old:$old,new:$new,user:$user){ _id } }`
      const variables = {
        password: props.password._id,
        old: passwordO,
        new: password,
        user: props.activeUser._id,
      }
      await askGraphQL(
        { query, variables },
        'update Password',
        props.sessionToken,
        props.applicationConfig
      )
      setPassword('')
      setPasswordO('')
      setPasswordC('')
      setIsUpdating(false)
    } catch (err) {
      alert(err)
    }
  }

  const setDefault = async (user) => {
    try {
      setIsUpdating(true)
      const query = `mutation($password:ID!, $user:ID!){ setPrimaryUser(password:$password,user:$user){ users { _id displayName email } } }`
      const variables = { password: props.password._id, user: user }
      const data = await askGraphQL(
        { query, variables },
        'Set user as default',
        props.sessionToken,
        props.applicationConfig
      )
      setIsUpdating(false)
      props.updateUser(data.setPrimaryUser.users)
    } catch (err) {
      alert(err)
    }
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <section className={styles.section}>
        <h1>Account selection</h1>
        <p>
          If your <strong>Credentials</strong> are associated with multiple{' '}
          <strong>Accounts</strong>, you'll be able to set active account and
          default active Account here.
        </p>
        <ul>
          {props.users.map((u, i) => (
            <CredentialsUserSelect
              key={`user-${u._id}`}
              {...props}
              u={u}
              setDefault={setDefault}
            />
          ))}
        </ul>
      </section>
      {props.password && (
        <section className={styles.section}>
          <h2>Change password</h2>
          <p>
            This section is strictly private, changing your password will only
            affect your combination of username/email and password. Other users
            having access to one or more of your available accounts won't be
            affected.
          </p>
          <form className={styles.passwordForm} onSubmit={(e) => changePassword(e)}>
            <Field
              type="password"
              placeholder="Old password"
              value={passwordO}
              onChange={(e) => setPasswordO(e.target.value)}
            />
            <Field
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Field
              type="password"
              placeholder="Confirm new password"
              className={password === passwordC ? null : styles.beware}
              value={passwordC}
              onChange={(e) => setPasswordC(e.target.value)}
            />
            <Button
              disabled={!password || !passwordO || password !== passwordC}
            >
              {isUpdating ? 'Updating..' : 'Change'}
            </Button>
          </form>
        </section>
      )}
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Credentials)
