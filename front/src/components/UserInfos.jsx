import React, { useState, useCallback } from 'react'
import { Check, Clipboard, Loader } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { useGraphQL } from '../helpers/graphQL'
import { updateUser } from './Credentials.graphql'
import etv from '../helpers/eventTargetValue'
import styles from './credentials.module.scss'
import formStyles from './field.module.scss'
import Button from './Button'
import Field from './Field'
import TimeAgo from './TimeAgo.jsx'

export default function UserInfos () {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const runQuery = useGraphQL()
  const activeUser = useSelector(state => state.activeUser, shallowEqual)
  const zoteroToken = useSelector(state => state.activeUser.zoteroToken)
  const sessionToken = useSelector(state => state.sessionToken)
  const [displayName, setDisplayName] = useState(activeUser.displayName)
  const [firstName, setFirstName] = useState(activeUser.firstName || '')
  const [lastName, setLastName] = useState(activeUser.lastName || '')
  const [institution, setInstitution] = useState(activeUser.institution || '')
  const [isSaving, setIsSaving] = useState(false)

  const updateActiveUserDetails = useCallback((payload) => dispatch({
    type: `UPDATE_ACTIVE_USER_DETAILS`,
    payload
  }), [])
  const clearZoteroToken = useCallback(() => dispatch({ type: 'CLEAR_ZOTERO_TOKEN' }), [])

  const unlinkZoteroAccount = useCallback(async (event) => {
    event.preventDefault()

    const variables = { user: activeUser._id, details: { zoteroToken: null } }
    await runQuery({ query: updateUser, variables })
    clearZoteroToken()
    setIsSaving(false)
  }, [])

  const updateInfo = useCallback(async (e) => {
    e.preventDefault()
    setIsSaving(true)
    const variables = {
      user: activeUser._id,
      details: { displayName, firstName, lastName, institution },
    }
    const { updateUser: userDetails } = await runQuery({ query: updateUser, variables })
    updateActiveUserDetails(userDetails)
    setIsSaving(false)
  }, [activeUser._id, displayName, firstName, lastName, institution])

  return (<>
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
          <Field  label="Zotero"className={styles.zotero}>
            <>
              {zoteroToken && <span>Linked with <code>{zoteroToken}</code> account.</span>}
              {!zoteroToken && <span>No linked account.</span>}
              {zoteroToken && (
                <Button title="Unlink this Zotero account" onClick={unlinkZoteroAccount}>
                  Unlink
                </Button>
              )}
            </>
          </Field>
          <div className={formStyles.footer}>
            <Button primary={true} disabled={isSaving}>
              {isSaving ? <Loader/> : <Check/>}
              Save changes
            </Button>
          </div>
        </form>
      </section>

      <section className={styles.section}>
        <div className={styles.info}>
          <Field label={t("user.account.email")}>
            <>{activeUser.email}</>
          </Field>
          {activeUser.username && <Field label="Username"><>{activeUser.username}</>
          </Field>}
          <Field label={t("user.account.authentication")}>
            <>{activeUser.authType === 'oidc' ? 'OpenID (External)' : 'Password'}</>
          </Field>
          <Field label={t("user.account.apiKey")} className={styles.apiKeyField}>
            <>
              <code className={styles.apiKeyValue} title={t("user.account.apiKeyValue", {token: sessionToken})}>{sessionToken}</code>
              <CopyToClipboard text={sessionToken}>
                <Button title={t("user.account.copyApiKey")} icon={true}>
                  <Clipboard/>
                </Button>
              </CopyToClipboard>
            </>
          </Field>
          <Field label={t("user.account.id")}>
            <code>{activeUser._id}</code>
          </Field>
          {activeUser.admin && <Field label="Admin">✔️</Field>}
          <Field label={t("user.account.createdAt")}>
            <TimeAgo date={activeUser.createdAt}/>
          </Field>
          <Field label={t("user.account.updatedAt")}>
            <TimeAgo date={activeUser.updatedAt}/>
          </Field>
        </div>
      </section>
    </>
  )
}
