import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate, useRevalidator } from 'react-router'
import { toast } from 'react-toastify'

import { useAccount, useLogout } from '../../../hooks/user.js'
import { FormActions } from '../../molecules/index.js'

import styles from './UserSection.module.scss'

export default function UserDeleteConfirm({ onCancel }) {
  const { t } = useTranslation('user', { useSuspense: false })
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteAccount } = useAccount()
  const logout = useLogout()
  const navigate = useNavigate()
  const revalidator = useRevalidator()
  const userId = useSelector((state) => state.activeUser._id)
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        setIsDeleting(true)
        try {
          const success = await deleteAccount({ userId })
          if (success === true) {
            // make sure the sessionToken is removed before navigate is called
            localStorage.removeItem('sessionToken')
            await revalidator.revalidate()
            // log out and redirect to the account deletion confirmation page
            await logout()
            navigate('/bye', { replace: true })
          } else {
            toast(
              t('actions.delete.form.error', {
                errMessage: 'Unexpected error',
              }),
              {
                type: 'error',
              }
            )
          }
        } catch (e) {
          toast(t('actions.delete.form.error', { errMessage: e.message }), {
            type: 'error',
          })
        } finally {
          setIsDeleting(false)
        }
      }}
      className={styles.form}
    >
      <div className={styles.description}>
        {t('actions.delete.form.confirm')}
      </div>

      <FormActions
        onCancel={onCancel}
        submitButton={{
          text: t('actions.delete.form.submit'),
          title: t('actions.delete.form.submit'),
          className: styles.danger,
          disabled: isDeleting,
        }}
      />
    </form>
  )
}
