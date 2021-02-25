import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import askGraphQL from '../helpers/graphQL'
import styles from './credentials.module.scss'
import CredentialsUserSelect from './CredentialsUserSelect'

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
    ;(async () => {
      try {
        const query = 'query{ refreshToken{ users { _id displayName email } } }'
        const data = await askGraphQL(
          { query },
          'fetching user',
          props.sessionToken,
          props.applicationConfig
        )
        props.updateUser(data.refreshToken.users)
        setIsLoading(false)
      } catch (err) {
        alert(`couldn't fetch users ${err}`)
      }
    })()
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

  return (
    <section className={styles.section}>
      <h1>Account selection</h1>
      <p>
        If your <strong>Credentials</strong> are associated with multiple{' '}
        <strong>Accounts</strong>, you'll be able to set active account and
        default active Account here ({isLoading ? 'fetching..' : 'up to date'})
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

      {props.password && (
        <>
          <h2>Change password</h2>
          <p>
            This section is strictly private, changing your password will only
            affect your combination of username/email and password. Other users
            having access to one or more of your available accounts won't be
            affected.
          </p>
          <form onSubmit={(e) => changePassword(e)}>
            <input
              type="password"
              placeholder="Old password"
              value={passwordO}
              onChange={(e) => setPasswordO(e.target.value)}
            />
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className={password === passwordC ? null : styles.beware}
              value={passwordC}
              onChange={(e) => setPasswordC(e.target.value)}
            />
            <button
              disabled={!password || !passwordO || password !== passwordC}
            >
              {isUpdating ? 'Updating..' : 'Change'}
            </button>
          </form>
        </>
      )}
    </section>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Credentials)
