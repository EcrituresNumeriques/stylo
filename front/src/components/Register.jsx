import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

import etv from '../helpers/eventTargetValue'
import validateEmail from '../helpers/validationEmail'

import { useGraphQL } from '../helpers/graphQL'

import styles from './login.module.scss'
import Field from './Field'
import Button from './Button'
import { ArrowLeftCircle, Check } from 'react-feather'

function Register () {
  const history = useHistory()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordC, setPasswordC] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [institution, setInstitution] = useState('')
  const runQuery = useGraphQL()

  const query = `mutation($email:String!, $username:String!, $password:String!, $displayName:String, $firstName:String, $lastName:String, $institution:String) {
       createUser(user: {
         email:$email,
         username:$username,
         password:$password,
         displayName:$displayName,
         firstName:$firstName,
         lastName:$lastName,
         institution:$institution
       }) { _id }
    }`
  let user = {
    email,
    username,
    password,
    passwordC,
    displayName,
    firstName,
    lastName,
    institution,
  }

  const createUser = async (query, user) => {
    if (user.password !== user.passwordC) {
      alert('Password and Password confirm mismatch')
      return false
    }
    if (user.password === '') {
      alert('password is empty')
      return false
    }
    if (user.username === '') {
      alert('Username is empty')
      return false
    }
    if (user.email === '') {
      alert('Email is empty')
      return false
    }
    if (!validateEmail(user.email)) {
      alert('Email appears to be malformed')
      return false
    }

    try {
      await runQuery({ query, variables: user })
      // if no error thrown, we can navigate to /
      history.push('/')
    } catch (err) {
      console.log('Unable to create a user', err)
    }
  }

  return (
    <section className={styles.box}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          createUser(query, user)
        }}
      >

        <h1>Create a Stylo account</h1>

        <fieldset>
          <legend>Required informations</legend>

          <Field id="email" type="email" label="Email*" autoComplete="email" required={true} onChange={(e) => setEmail(etv(e))} />
          <Field id="username" label="Username*" autoComplete="username" required={true} onChange={(e) => setUsername(etv(e))} />
          <Field id="password" type="password" label="Password*" autoComplete="new-password" required={true} onChange={(e) => setPassword(etv(e))} />
          <Field id="passwordc" type="password" label="Confirm Password*" autoComplete="new-password" required={true} onChange={(e) => setPasswordC(etv(e))} className={password === passwordC ? null : styles.beware} />
        </fieldset>

        <fieldset>
          <legend>Optional details</legend>

          <Field id="display-name" label="Display Name" onChange={(e) => setDisplayName(etv(e))} />
          <Field id="first-name" label="First Name" onChange={(e) => setFirstName(etv(e))} />
          <Field id="last-name" label="Last Name" onChange={(e) => setLastName(etv(e))} />
          <Field id="institution" label="Organization" onChange={(e) => setInstitution(etv(e))} />
        </fieldset>

        <ul className={styles.actions}>
          <li>
            <Link to="/"><ArrowLeftCircle className={styles.inlineIcon} size={20} />Go back to Login</Link>
          </li>
          <li className={styles.actionsSubmit}>
            <Button primary={true} type="submit">
              <Check /> Create
            </Button>
          </li>
        </ul>
      </form>
    </section>
  )
}

export default Register
