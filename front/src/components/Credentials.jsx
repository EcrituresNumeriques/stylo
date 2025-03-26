import React from 'react'

import PasswordChange from './credentials/PasswordChange.jsx'
import UserProfile from './credentials/UserProfile.jsx'
import AuthProviders from './credentials/AuthProviders.jsx'

export default function Credentials() {
  return (
    <>
      <UserProfile />
      <AuthProviders />
      <PasswordChange />
    </>
  )
}
