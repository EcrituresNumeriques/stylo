import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { useGraphQLClient } from '../helpers/graphQL'
import { changePassword as changePasswordQuery } from './Credentials.graphql'
import styles from './credentials.module.scss'
import fieldStyles from './field.module.scss'
import Button from './Button'
import Field from './Field'
import clsx from 'clsx'

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

  const canSubmit = useMemo(() => {
    if (hasExistingPassword) {
      return passwordO && password && passwordC && password === passwordC
    } else {
      return password && passwordC && password === passwordC
    }
  })

  const changePassword = async (e) => {
    e.preventDefault()
    try {
      setIsUpdating(true)
      const variables = {
        old: passwordO,
        new: password,
        user: userId,
      }
      await query({ query: changePasswordQuery, variables })
      setPassword('')
      setPasswordO('')
      setPasswordC('')
      setIsUpdating(false)
    } catch (err) {
      alert(err)
    }
  }

  return (
    <section className={styles.section}>
      <h2>{t('credentials.changePassword.title')}</h2>
      <p>{t('credentials.changePassword.para')}</p>
      <form
        className={clsx(styles.passwordForm, fieldStyles.inlineFields)}
        onSubmit={(e) => changePassword(e)}
        name={t('credentials.changePassword.title')}
      >
        {hasExistingPassword && (
          <Field
            type="password"
            name="old-password"
            autoComplete="old-password"
            placeholder={t('credentials.oldPassword.placeholder')}
            aria-label={t('credentials.oldPassword.placeholder')}
            value={passwordO}
            onChange={(e) => setPasswordO(e.target.value)}
          />
        )}
        <Field
          type="password"
          name="new-password"
          autoComplete="new-password"
          placeholder={t('credentials.newPassword.placeholder')}
          aria-label={t('credentials.newPassword.placeholder')}
          minLength={6}
          required={true}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          type="password"
          name="new-password-confirmation"
          autoComplete="new-password"
          placeholder={t('credentials.confirmNewPassword.placeholder')}
          aria-label={t('credentials.confirmNewPassword.placeholder')}
          className={password === passwordC ? null : styles.beware}
          minLength={6}
          required={true}
          value={passwordC}
          onChange={(e) => setPasswordC(e.target.value)}
        />
        <Button disabled={!canSubmit} primary={true}>
          {isUpdating
            ? t('credentials.updatePassword.updatingButton')
            : t('credentials.updatePassword.confirmButton')}
        </Button>
      </form>
    </section>
  )
}
