import React, { useState, useEffect, useCallback } from 'react'
import { Check, Clipboard, Loader } from 'react-feather'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { useGraphQL } from '../helpers/graphQL'
import { getUserDetails, updateUser } from './Credentials.graphql'
import etv from '../helpers/eventTargetValue'
import styles from './credentials.module.scss'
import formStyles from './field.module.scss'
import Button from "./Button";
import Field from "./Field";
import formatTimeAgo from '../helpers/formatTimeAgo';

export default function UserInfos () {
  const dispatch = useDispatch()
  const runQuery = useGraphQL()
  const activeUser = useSelector(state => state.activeUser, shallowEqual)
  const sessionToken = useSelector(state => state.sessionToken)
  const userId = activeUser._id
  const [displayName, setDisplayName] = useState(activeUser.displayName)
  const [firstName, setFirstName] = useState(activeUser.firstName)
  const [lastName, setLastName] = useState(activeUser.lastName)
  const [institution, setInstitution] = useState(activeUser.institution)
  const [yaml, setYaml] = useState(activeUser.yaml)
  const [user, setUser] = useState(activeUser)
  const [isSaving, setIsSaving] = useState(false)

  const updateActiveUser = useCallback((payload) => dispatch({ type: `UPDATE_ACTIVE_USER`, payload }), [])
  const clearZoteroToken = useCallback(() => dispatch({ type: 'CLEAR_ZOTERO_TOKEN' }), [])

  useEffect(() => {
    ;(async () => {
      try {
        const variables = { user: userId }
        const data = await runQuery({ query: getUserDetails, variables })
        setDisplayName(data.user.displayName)
        setFirstName(data.user.firstName || '')
        setLastName(data.user.lastName || '')
        setInstitution(data.user.institution || '')
        setYaml(data.user.yaml || '')
        setUser(data.user)
      } catch (err) {
        alert(`couldn't fetch user ${err}`)
      }
    })()
  }, [])

  const unlinkZoteroAccount = async () => {
    const variables = { user: userId, details: { zoteroToken: null } }
    const data = await runQuery({ query: updateUser, variables })
    setUser(data.updateUser)
    clearZoteroToken()
    setIsSaving(false)
  }

  const updateInfo = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const variables = {
        user: userId,
        details: { yaml, displayName, firstName, lastName, institution },
      }
      const data = await runQuery({ query: updateUser, variables })
      setDisplayName(data.updateUser.displayName)
      updateActiveUser(displayName)
      setFirstName(data.updateUser.firstName || '')
      setLastName(data.updateUser.lastName || '')
      setInstitution(data.updateUser.institution || '')
      setYaml(data.updateUser.yaml || '')
      setUser(data.updateUser)
      setIsSaving(false)
    } catch (err) {
      alert(`Couldn't update User: ${err}`)
    }
  }

  return (<>
    <section className={styles.section}>
      <h2>Account information</h2>
      <form onSubmit={updateInfo}>
        <Field
          id="displayNameField"
          label="Display name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(etv(e))}
          placeholder="Display name"
        />
        <Field
          id="firstNameField"
          label="First Name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(etv(e))}
          placeholder="First name"
        />
        <Field
          id="lastNameField"
          label="Last Name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(etv(e))}
          placeholder="Last name"
        />
        <Field
          id="institutionField"
          label="Institution"
          type="text"
          value={institution}
          onChange={(e) => setInstitution(etv(e))}
          placeholder="Institution name"
        />
        <Field id="yamlField" label="Default YAML">
          <textarea
            id="yamlField"
            wrap="off"
            value={yaml || ""}
            onChange={(e) => setYaml(etv(e))}
            placeholder=""
          />
        </Field>
        <Field  label="Zotero">
          <>
            {user.zoteroToken && <span>Linked with <b>{user.zoteroToken}</b> account.</span>}
            {!user.zoteroToken && <span>No linked account.</span>}
            {user.zoteroToken && (
              <Button
                title="Unlink this Zotero account"
                onClick={(e) => e.preventDefault() || unlinkZoteroAccount()}
              >
                Unlink
              </Button>
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
      <Field label="Account email">
        <>{user.email}</>
      </Field>
      <Field label="Account type">
        <>{user.authType === 'oidc' ? 'External (OpenID)' : 'Local'}</>
      </Field>
      <Field label="API Key">
        <>
          <code className={styles.apiKey} title={`API Key value is ${sessionToken}`}>{sessionToken}</code>
          <CopyToClipboard text={sessionToken}>
            <Button title="Copy API Key value to clipboard" icon={true}>
              <Clipboard />
            </Button>
          </CopyToClipboard>
        </>
      </Field>
      <Field label="Identifier">
        <code>{user._id}</code>
      </Field>
      <Field label="Status">
        <>{user.admin ? 'Admin' : 'Basic account'}</>
      </Field>
      <Field label="Created At">
        <time dateTime={user.createdAt}>{formatTimeAgo(user.createdAt)}</time>
      </Field>
      <Field label="Updated At">
        <time dateTime={user.updatedAt}>{formatTimeAgo(user.updatedAt)}</time>
      </Field>
    </section>
  </>
  )
}
