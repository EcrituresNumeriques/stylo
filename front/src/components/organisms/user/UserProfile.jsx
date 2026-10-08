import { Check, Loader } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { fromFormData } from '../../../helpers/forms.js'
import { useGraphQLClient } from '../../../helpers/graphQL.js'
import { updateUser } from '../../../hooks/Credentials.graphql'
import formStyles from '../../atoms/Field.module.scss'
import { Button, Field, TimeAgo } from '../../atoms/index.js'
import styles from './UserSection.module.scss'

export default function UserProfile() {
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

  const updateInfo = useCallback(
    async (e) => {
      e.preventDefault()
      setIsSaving(true)
      const form = e.target
      const variables = {
        details: fromFormData(form),
      }
      try {
        const { updateUser: userDetails } = await query({
          query: updateUser,
          variables,
        })
        updateActiveUserDetails(userDetails)
        toast(t('user.account.updateSuccess'), { type: 'info' })
      } catch (err) {
        if (err.code === 'EMAIL_ALREADY_EXISTS') {
          form.elements.email.value = activeUser.email ?? ''
          toast(t('user.account.emailAlreadyExists'), { type: 'error' })
        } else {
          toast(t('user.account.updateError', { errMessage: err.message }), {
            type: 'error',
          })
        }
      } finally {
        setIsSaving(false)
      }
    },
    [query, updateActiveUserDetails, t, activeUser.email]
  )

  return (
    <>
      <section className={styles.section} id="profile">
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
            name="lastName"
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
          <Field
            name="email"
            label={t('user.account.email')}
            type="email"
            autoComplete="email"
            defaultValue={activeUser.email}
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
