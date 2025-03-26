import React, { useState, useCallback } from 'react'
import { Check, Loader } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { Helmet } from 'react-helmet'

import { useGraphQLClient } from '../helpers/graphQL'
import { updateUser } from './Credentials.graphql'

import { useSetAuthToken } from '../hooks/user.js'

import etv from '../helpers/eventTargetValue'
import styles from './credentials.module.scss'
import formStyles from './field.module.scss'
import Button from './Button'
import Field from './Field'
import TimeAgo from './TimeAgo.jsx'

export default function UserInfos() {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { query } = useGraphQLClient()
  const activeUser = useSelector((state) => state.activeUser, shallowEqual)
  const zoteroToken = useSelector((state) => state.activeUser.zoteroToken)
  const sessionToken = useSelector((state) => state.sessionToken)
  const [displayName, setDisplayName] = useState(activeUser.displayName)
  const [firstName, setFirstName] = useState(activeUser.firstName || '')
  const [lastName, setLastName] = useState(activeUser.lastName || '')
  const [institution, setInstitution] = useState(activeUser.institution || '')
  const [isSaving, setIsSaving] = useState(false)

  const updateActiveUserDetails = useCallback(
    (payload) =>
      dispatch({
        type: `UPDATE_ACTIVE_USER_DETAILS`,
        payload,
      }),
    []
  )

  const { link: linkZoteroAccount, unlink: unlinkZoteroAccount } =
    useSetAuthToken('zotero')

  const updateInfo = useCallback(
    async (e) => {
      e.preventDefault()
      setIsSaving(true)
      const variables = {
        user: activeUser._id,
        details: { displayName, firstName, lastName, institution },
      }
      const { updateUser: userDetails } = await query({
        query: updateUser,
        variables,
      })
      updateActiveUserDetails(userDetails)
      setIsSaving(false)
    },
    [activeUser._id, displayName, firstName, lastName, institution]
  )

  return (
    <>
      <Helmet>
        <title>{t('user.account.title')}</title>
      </Helmet>
      <section className={styles.section}>
        <h2>{t('user.account.title')}</h2>
        <form onSubmit={updateInfo} className={styles.form}>
          <Field
            id="displayNameField"
            label={t('user.account.displayName')}
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(etv(e))}
          />
          <Field
            id="firstNameField"
            label={t('user.account.firstName')}
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(etv(e))}
          />
          <Field
            id="lastNameField"
            label={t('user.account.lastName')}
            type="text"
            value={lastName}
            onChange={(e) => setLastName(etv(e))}
          />
          <Field
            id="institutionField"
            label={t('user.account.institution')}
            type="text"
            value={institution}
            onChange={(e) => setInstitution(etv(e))}
          />
          <Field label="Zotero">
            <>
              {zoteroToken && (
                <div className={styles.zotero}>
                  <p>
                    {t('credentials.authentication.linkedService.description', {
                      service: 'Zotero',
                      token: zoteroToken,
                    })}
                  </p>
                  <Button
                    onClick={unlinkZoteroAccount}
                    type="button"
                    aria-label={t('credentials.authentication.unlinkLabel', {
                      service: 'zotero',
                    })}
                  >
                    {t('credentials.authentication.unlinkButton')}
                  </Button>
                </div>
              )}
              {!zoteroToken && (
                <div className={styles.zotero}>
                  <p>
                    {t(
                      'credentials.authentication.unlinkedService.description'
                    )}
                  </p>

                  <Button
                    onClick={linkZoteroAccount}
                    type="button"
                    aria-label={t('credentials.authentication.linkLabel', {
                      service: 'zotero',
                    })}
                  >
                    {t('credentials.authentication.linkButton')}
                  </Button>
                </div>
              )}
            </>
          </Field>
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
              {activeUser.authType === 'oidc'
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
