import React, { useState, useEffect, useCallback } from 'react'
import { Check, Loader } from 'react-feather'
import { useSelector, useDispatch, shallowEqual } from 'react-redux'

import { useGraphQL } from '../helpers/graphQL'
import etv from '../helpers/eventTargetValue'
import styles from './credentials.module.scss'
import formStyles from './field.module.scss'
import Button from "./Button";
import Field from "./Field";
import formatTimeAgo from '../helpers/formatTimeAgo';
import CheckboxWidget from "@rjsf/core/lib/components/widgets/CheckboxWidget";

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
        const query = `query($user:ID!){user(user:$user){ displayName _id email admin createdAt updatedAt yaml firstName zoteroToken lastName institution }}`
        const variables = { user: userId }
        const data = await runQuery({ query, variables })
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
    const query = `mutation($user:ID!,$zoteroToken:String){updateUser(user:$user, zoteroToken:$zoteroToken){ displayName _id email admin createdAt updatedAt yaml firstName lastName institution zoteroToken }}`
    const variables = { user: userId, zoteroToken: null }
    const data = await runQuery({ query, variables })
    setUser(data.updateUser)
    clearZoteroToken()
    setIsSaving(false)
  }

  const updateInfo = async (e) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const query = `mutation($user:ID!,$displayName:String!,$firstName:String,$lastName:String, $institution:String,$yaml:String){updateUser(user:$user,displayName:$displayName,firstName:$firstName, lastName: $lastName, institution:$institution, yaml:$yaml){ displayName _id email admin createdAt updatedAt yaml firstName lastName institution zoteroToken }}`
      const variables = {
        user: userId,
        yaml,
        displayName,
        firstName,
        lastName,
        institution,
      }
      const data = await runQuery({ query, variables })
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
        <Field  label="Zotero">
          <>
            {user.zoteroToken ? (
              <span>
              Linked with <b>{user.zoteroToken}</b> account.
            </span>
            ) : (
              <span>No linked account.</span>
            )}
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
        <Field label="Default YAML">
          <textarea
            id="yamlField"
            value={yaml || ""}
            onChange={(e) => setYaml(etv(e))}
            placeholder=""
          />
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
        <code>{sessionToken}</code>
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
