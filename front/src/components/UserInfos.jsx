import React, { useState, useCallback } from 'react'
import { Check, Clipboard, Loader } from 'react-feather'
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
import MonacoYamlEditor from './Write/providers/monaco/YamlEditor'

export default function UserInfos () {
  const dispatch = useDispatch()
  const runQuery = useGraphQL()
  const activeUser = useSelector(state => state.activeUser, shallowEqual)
  const zoteroToken = useSelector(state => state.activeUser.zoteroToken)
  const sessionToken = useSelector(state => state.sessionToken)
  const [displayName, setDisplayName] = useState(activeUser.displayName)
  const [firstName, setFirstName] = useState(activeUser.firstName || '')
  const [lastName, setLastName] = useState(activeUser.lastName || '')
  const [institution, setInstitution] = useState(activeUser.institution || '')
  const [yaml, setYaml] = useState(activeUser.yaml)
  const [isSaving, setIsSaving] = useState(false)

  const updateActiveUserDetails = useCallback((payload) => dispatch({ type: `UPDATE_ACTIVE_USER_DETAILS`, payload }), [])
  const clearZoteroToken = useCallback(() => dispatch({ type: 'CLEAR_ZOTERO_TOKEN' }), [])
  const handleYamlUpdate = useCallback((yaml) => setYaml(yaml), [])

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
      details: { yaml, displayName, firstName, lastName, institution },
    }
    const { updateUser: userDetails } = await runQuery({ query: updateUser, variables })
    updateActiveUserDetails(userDetails)
    setIsSaving(false)
  }, [activeUser._id, yaml, displayName, firstName, lastName, institution])

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
          <MonacoYamlEditor
            id="yamlField"
            text={activeUser.yaml}
            onTextUpdate={handleYamlUpdate}
          />
        </Field>
        <Field  label="Zotero">
          <>
            {zoteroToken && <span>Linked with <b>{zoteroToken}</b> account.</span>}
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
            {isSaving ? <Loader /> : <Check />}
            Save changes
          </Button>
        </div>
      </form>
    </section>

    <section className={styles.section}>
      <Field label="Email">
        <>{activeUser.email}</>
      </Field>
      {activeUser.username && <Field label="Username"><>{activeUser.username}</></Field>}
      <Field label="Authentication">
        <>{activeUser.authType === 'oidc' ? 'OpenID (External)' : 'Password'}</>
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
        <code>{activeUser._id}</code>
      </Field>
      {activeUser.admin && <Field label="Admin">✔️</Field>}
      <Field label="Created">
        <TimeAgo date={activeUser.createdAt}/>
      </Field>
      <Field label="Updated">
        <TimeAgo date={activeUser.updatedAt}/>
      </Field>
    </section>
  </>
  )
}
