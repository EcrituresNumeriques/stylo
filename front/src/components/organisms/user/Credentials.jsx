import AuthProviders from './AuthProviders.jsx'
import PasswordChange from './PasswordChange.jsx'
import UserBackup from './UserBackup.jsx'
import UserProfile from './UserProfile.jsx'

export default function Credentials() {
  return (
    <>
      <UserProfile />
      <AuthProviders />
      <PasswordChange />
      <UserBackup />
    </>
  )
}
