import React, { useState, useCallback } from 'react'
import { Check, Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { Helmet } from 'react-helmet'

import { useGraphQLClient } from '../../helpers/graphQL'
import { updateUser } from '../Credentials.graphql'

import { fromFormData } from '../../helpers/forms.js'

import styles from '../credentials.module.scss'
import formStyles from '../field.module.scss'
import Button from '../Button'
import Field from '../Field'
import TimeAgo from '../TimeAgo.jsx'

export default function UserInfos() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { query } = useGraphQLClient()
  const activeUser = useSelector((state) => state.activeUser, shallowEqual)

  const sessionToken = useSelector((state) => state.sessionToken)
  const [isSaving, setIsSaving] = useState(false)

  const updateActiveUserDetails = useCallback(
    (payload) =>
      dispatch({
        type: `UPDATE_ACTIVE_USER_DETAILS`,
        payload,
      }),
    []
  )

  const updateInfo = useCallback(async (e) => {
    e.preventDefault()
    setIsSaving(true)
    const variables = {
      user: activeUser._id,
      details: fromFormData(e.target),
    }
    const { updateUser: userDetails } = await query({
      query: updateUser,
      variables,
    })
    updateActiveUserDetails(userDetails)
    setIsSaving(false)
  }, [])

  return (
    <>
      <Helmet>
        <title>{t('user.account.title')}</title>
      </Helmet>
      <section className={styles.section}>
        <h2>{t('user.account.title')}</h2>

        <form onSubmit={updateInfo} className={styles.form}>
          <Field
            name="displayName"
            label={t('user.account.displayName')}
            type="text"
            defaultValue={activeUser.displayName}
          />
          <Field
            name="firstName"
            label={t('user.account.firstName')}
            type="text"
            defaultValue={activeUser.firstName}
          />
          <Field
            id="lastName"
            label={t('user.account.lastName')}
            type="text"
            defaultValue={activeUser.lastName}
          />
          <Field
            name="institution"
            label={t('user.account.institution')}
            type="text"
            defaultValue={activeUser.institution}
          />

          <div className={formStyles.footer}>
            <Button primary={true} disabled={isSaving}>
              {isSaving ? <Loader /> : <Check />}
              Save changes
            </Button>
          </div>
        </form>
      </section>

      <section className={styles.section}>
        <div className={styles.info}>
          <Field label={t('user.account.email')}>
            <>{activeUser.email}</>
          </Field>
          {activeUser.username && (
            <Field label="Username">
              <>{activeUser.username}</>
            </Field>
          )}
          <Field label={t('user.account.authentication')}>
            <>
              {activeUser.authTypes.includes('oidc')
                ? 'OpenID (External)'
                : 'Password'}
            </>
          </Field>
          <Field
            label={t('user.account.apiKey')}
            className={styles.apiKeyField}
          >
            <code
              className={styles.apiKeyValue}
              title={t('user.account.apiKeyValue', { token: sessionToken })}
            >
              {sessionToken}
            </code>
          </Field>
          <Field label={t('user.account.id')}>
            <code>{activeUser._id}</code>
          </Field>
          <Field label={t('user.account.createdAt')}>
            <TimeAgo date={activeUser.createdAt} />
          </Field>
          <Field label={t('user.account.updatedAt')}>
            <TimeAgo date={activeUser.updatedAt} />
          </Field>
        </div>
      </section>
    </>
  )
}
