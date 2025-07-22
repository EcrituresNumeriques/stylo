import { Check, Loader } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'

import { useGraphQLClient } from '../../helpers/graphQL'
import Button from '../Button'
import Field from '../Field'

import { fromFormData } from '../../helpers/forms.js'
import { useAuthStore } from '../../stores/authStore.js'

import TimeAgo from '../TimeAgo.jsx'

import { updateUser } from '../Credentials.graphql'

import styles from '../credentials.module.scss'
import formStyles from '../field.module.scss'

export default function UserInfos() {
  const { t } = useTranslation()
  const { query } = useGraphQLClient()
  const { user: activeUser } = useRouteLoaderData('app')

  const { sessionToken } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)

  const updateActiveUserDetails = useCallback((payload) => {
    // FIXME: Use SWR to update user!
    /*
    return dispatch({
      type: `UPDATE_ACTIVE_USER_DETAILS`,
      payload,
    })*/
  }, [])

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
        <dl className={styles.info}>
          <dt>{t('user.account.email')}</dt>
          <dd>{activeUser.email}</dd>

          <dt>{t('user.account.id')}</dt>
          <dd>
            <code>{activeUser._id}</code>
          </dd>

          {activeUser.username && (
            <>
              <dt>{t('user.account.username')}</dt>
              <dd>{activeUser.username}</dd>
            </>
          )}

          <dt>{t('user.account.apiKey')}</dt>
          <dd>
            <code className={styles.apiKeyValue}>{sessionToken}</code>
          </dd>

          <dt>{t('user.account.createdAt')}</dt>
          <dd>
            <TimeAgo date={activeUser.createdAt} />
          </dd>

          <dt>{t('user.account.updatedAt')}</dt>
          <dd>
            <TimeAgo date={activeUser.updatedAt} />
          </dd>
        </dl>
      </section>
    </>
  )
}
