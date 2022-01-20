import React, { useState } from 'react'
import { connect } from 'react-redux'

import askGraphQL from '../helpers/graphQL'
import styles from './credentials.module.scss'
import Loading from "./Loading";
import UserInfos from "./UserInfos";
import CredentialsAccountSharing from "./CredentialsAccountSharing";
import Button from "./Button";
import Field from "./Field";

const mapStateToProps = ({
  activeUser,
  sessionToken,
  applicationConfig,
}) => {
  return { activeUser, sessionToken, applicationConfig }
}

const Credentials = ({ activeUser, sessionToken, applicationConfig }) => {
  const [password, setPassword] = useState('')
  const [passwordO, setPasswordO] = useState('')
  const [passwordC, setPasswordC] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const changePassword = async (e) => {
    e.preventDefault()
    try {
      setIsUpdating(true)
      const query = `mutation($old:String!, $new:String!, $user:ID!){ changePassword(old:$old, new:$new, user:$user){ _id } }`
      const variables = {
        old: passwordO,
        new: password,
        user: activeUser._id,
      }
      await askGraphQL(
        { query, variables },
        'update Password',
        sessionToken,
        applicationConfig
      )
      setPassword('')
      setPasswordO('')
      setPasswordC('')
      setIsUpdating(false)
    } catch (err) {
      alert(err)
    }
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <UserInfos />

      <section className={styles.section}>
        <h2>Change password</h2>
        <p>
          This section is strictly private, changing your password will only
          affect your combination of username/email and password. Other users
          having access to one or more of your available accounts won&apos;t be
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
            primary={true}
          >
            {isUpdating ? 'Updating…' : 'Change'}
          </Button>
        </form>
      </section>

      <CredentialsAccountSharing />
    </>
  )
}

export default connect(mapStateToProps)(Credentials)
