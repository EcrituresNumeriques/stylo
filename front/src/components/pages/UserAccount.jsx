import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

import AuthProviders from '../organisms/user/AuthProviders.jsx'
import PasswordChange from '../organisms/user/PasswordChange.jsx'
import UserBackup from '../organisms/user/UserBackup.jsx'
import UserDelete from '../organisms/user/UserDelete.jsx'
import UserProfile from '../organisms/user/UserProfile.jsx'

export default function UserAccount() {
  const { t } = useTranslation()
  return (
    <>
      <Helmet>
        <title>{t('user.account.title')}</title>
      </Helmet>
      <UserProfile />
      <AuthProviders />
      <PasswordChange />
      <UserBackup />
      <UserDelete />
    </>
  )
}
