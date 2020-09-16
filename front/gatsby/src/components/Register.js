import React, { useState } from 'react'
import { Link, navigate } from 'gatsby'

import etv from '../helpers/eventTargetValue'
import validateEmail from '../helpers/validationEmail'

import askGraphQL from '../helpers/graphQL'

import styles from './register.module.scss'

const Register = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordC, setPasswordC] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [institution, setInstitution] = useState('')
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
      await askGraphQL({ query, variables: user })
      // if no error thrown, we can navigate to /
      navigate('/')
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
        <h1>Required</h1>
        <input
          type="text"
          placeholder="Email*"
          className={validateEmail(email) ? null : styles.beware}
          value={email}
          onChange={(e) => setEmail(etv(e))}
        />
        <input
          type="text"
          placeholder="Username*"
          value={username}
          onChange={(e) => setUsername(etv(e))}
        />
        <input
          type="password"
          placeholder="Password*"
          value={password}
          onChange={(e) => setPassword(etv(e))}
        />
        <input
          type="password"
          placeholder="Confirm password*"
          className={password === passwordC ? null : styles.beware}
          value={passwordC}
          onChange={(e) => setPasswordC(etv(e))}
        />
        <h1>Optional</h1>
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(etv(e))}
        />
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(etv(e))}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(etv(e))}
        />
        <input
          type="text"
          placeholder="Institution"
          value={institution}
          onChange={(e) => setInstitution(etv(e))}
        />
        <input type="submit" value="Create" />
        <p className="note">
          or <Link to="/">login</Link>
        </p>
      </form>
    </section>
  )
}

export default Register
