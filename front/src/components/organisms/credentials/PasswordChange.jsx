import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { useGraphQLClient } from '../../../helpers/graphQL.js'
import { Button, Field } from '../../atoms/index.js'

import { changePassword as changePasswordQuery } from '../../../hooks/Credentials.graphql'

import formStyles from '../../molecules/form.module.scss'
import styles from '../user/credentials.module.scss'

export default function Credentials() {
  const [password, setPassword] = useState('')
  const [passwordO, setPasswordO] = useState('')
  const [passwordC, setPasswordC] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const userId = useSelector((state) => state.activeUser._id)
  const hasExistingPassword = useSelector((state) =>
    state.activeUser.authTypes.includes('local')
  )
  const { query } = useGraphQLClient()
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const canSubmit = useMemo(() => {
    if (hasExistingPassword) {
      return passwordO && password && passwordC && password === passwordC
    } else {
      return password && passwordC && password === passwordC
    }
  }, [passwordO, password, passwordC])

  const updateActiveUserDetails = useCallback(
    (payload) =>
      dispatch({
        type: `UPDATE_ACTIVE_USER_DETAILS`,
        payload,
      }),
    []
  )

  const changePassword = async (e) => {
    e.preventDefault()
    try {
      setIsUpdating(true)
      const variables = {
        old: passwordO,
        new: password,
        user: userId,
      }
      const { changePassword: details } = await query({
        query: changePasswordQuery,
        variables,
      })
      updateActiveUserDetails(details)

      setPassword('')
      setPasswordO('')
      setPasswordC('')
    } catch (err) {
      alert(err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <section className={styles.section}>
      <h2>{t('credentials.changePassword.title')}</h2>

      <form
        className={formStyles.form}
        onSubmit={(e) => changePassword(e)}
        name={t('credentials.changePassword.title')}
      >
        {hasExistingPassword && (
          <Field
            type="password"
            name="old-password"
            autoComplete="old-password"
            label={t('credentials.oldPassword.label')}
            value={passwordO}
            onChange={(e) => setPasswordO(e.target.value)}
          />
        )}
        <Field
          type="password"
          name="new-password"
          autoComplete="new-password"
          label={t('credentials.newPassword.label')}
          minLength={6}
          required={true}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          type="password"
          name="new-password-confirmation"
          autoComplete="new-password"
          label={t('credentials.confirmNewPassword.label')}
          className={password === passwordC ? null : styles.beware}
          minLength={6}
          required={true}
          value={passwordC}
          onChange={(e) => setPasswordC(e.target.value)}
        />

        <p>
          <Button disabled={!canSubmit} primary={true}>
            {isUpdating
              ? t('credentials.updatePassword.updatingButton')
              : t('credentials.updatePassword.confirmButton')}
          </Button>
        </p>
      </form>
    </section>
  )
}
