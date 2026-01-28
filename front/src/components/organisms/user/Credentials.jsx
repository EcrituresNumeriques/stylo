import React from 'react'

import AuthProviders from '../credentials/AuthProviders.jsx'
import PasswordChange from '../credentials/PasswordChange.jsx'
import UserProfile from '../credentials/UserProfile.jsx'

export default function Credentials() {
  return (
    <>
      <UserProfile />
      <AuthProviders />
      <PasswordChange />
    </>
  )
}
