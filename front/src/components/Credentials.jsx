import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'


import { useGraphQL } from '../helpers/graphQL'
import { changePassword as query } from './Credentials.graphql'
import styles from './credentials.module.scss'
import fieldStyles from './field.module.scss'
import UserInfos from "./UserInfos";
import Button from "./Button";
import Field from "./Field";
import clsx from 'clsx'

export default function Credentials () {
  const [password, setPassword] = useState('')
  const [passwordO, setPasswordO] = useState('')
  const [passwordC, setPasswordC] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const userId = useSelector(state => state.activeUser._id)
  const runQuery = useGraphQL()
  const { t } = useTranslation()

  const changePassword = async (e) => {
    e.preventDefault()
    try {
      setIsUpdating(true)
      const variables = {
        old: passwordO,
        new: password,
        user: userId,
      }
      await runQuery({ query, variables })
      setPassword('')
      setPasswordO('')
      setPasswordC('')
      setIsUpdating(false)
    } catch (err) {
      alert(err)
    }
  }

  return (
    <>
      <UserInfos />

      <section className={styles.section}>
        <h2>{t('credentials.changePassword.title')}</h2>
        <p>
          {t('credentials.changePassword.para')}
        </p>
        <form className={clsx(styles.passwordForm, fieldStyles.inlineFields)} onSubmit={(e) => changePassword(e)}>
          <Field
            type="password"
            placeholder= {t('credentials.oldPassword.placeholder')}
            value={passwordO}
            onChange={(e) => setPasswordO(e.target.value)}
          />
          <Field
            type="password"
            placeholder= {t('credentials.newPassword.placeholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Field
            type="password"
            placeholder= {t('credentials.confirmNewPassword.placeholder')}
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
    </>
  )
}
