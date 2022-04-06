import React, { useState, useEffect, useCallback } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import { Check, Loader } from 'react-feather'

import askGraphQL from '../helpers/graphQL'
import etv from '../helpers/eventTargetValue'
import styles from './credentials.module.scss'
import formStyles from './field.module.scss'
import Button from "./Button";
import Field from "./Field";
import formatTimeAgo from '../helpers/formatTimeAgo';
import CheckboxWidget from "@rjsf/core/lib/components/widgets/CheckboxWidget";

const mapStateToProps = ({
  password,
  activeUser,
  sessionToken,
  applicationConfig,
}) => {
  return { password, activeUser, sessionToken, applicationConfig }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateActiveUser: (displayName) =>
      dispatch({ type: `UPDATE_ACTIVE_USER`, payload: displayName }),
    clearZoteroToken: () => dispatch({ type: 'CLEAR_ZOTERO_TOKEN' }),
  }
}

const ConnectedUser = (props) => {
  const [displayName, setDisplayName] = useState(props.activeUser.displayName)
  const [firstName, setFirstName] = useState(props.activeUser.firstName)
  const [lastName, setLastName] = useState(props.activeUser.lastName)
  const [institution, setInstitution] = useState(props.activeUser.institution)
  const [yaml, setYaml] = useState(props.activeUser.yaml)
  const [user, setUser] = useState(props.activeUser)
  const [isSaving, setIsSaving] = useState(false)
  const { clearZoteroToken } = props

  const unlinkZoteroAccount = async () => {
    const query = `mutation($user:ID!,$zoteroToken:String){updateUser(user:$user, zoteroToken:$zoteroToken){ displayName _id email admin createdAt updatedAt yaml firstName lastName institution zoteroToken }}`
    const variables = { user: props.activeUser._id, zoteroToken: null }
    setIsSaving(true)
    const data = await askGraphQL(
      { query, variables },
      'clear Zotero Token',
      props.sessionToken,
      props.applicationConfig
    )
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
        user: props.activeUser._id,
        yaml,
        displayName,
        firstName,
        lastName,
        institution,
      }
      const data = await askGraphQL(
        { query, variables },
        'updating user',
        props.sessionToken,
        props.applicationConfig
      )
      //setDisplayNameH1(data.updateUser.displayName)
      setDisplayName(data.updateUser.displayName)
      props.updateActiveUser(displayName)
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
  const dispatch = useDispatch()
  const preferredEditorMonaco = useSelector(state => state.userPreferences.preferredEditorMonaco)
  const togglePreferredEditorMonaco = useCallback(() => dispatch({ type: 'USER_PREFERENCES_TOGGLE', key: 'preferredEditorMonaco' }), [])

  return (<>
    <section className={styles.section}>
      <h2>Account information</h2>
      <form onSubmit={(e) => updateInfo(e)}>
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
        <Field
          label="Zotero"
        >
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
        <h2>Preferences</h2>
        <input type="checkbox" id="preferred-editor-monaco" onChange={() => togglePreferredEditorMonaco()} checked={preferredEditorMonaco}/>
        <label htmlFor="preferred-editor-monaco">Use experimental text editor</label>
      </section>

    <section className={styles.section}>
      <Field label="Account email">
        <>{user.email}</>
      </Field>
      <Field label="Account type">
        <>{user.authType === 'oidc' ? 'External (OpenID)' : 'Local'}</>
      </Field>
      <Field label="API Key">
        <code>{props.sessionToken}</code>
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

const User = connect(mapStateToProps, mapDispatchToProps)(ConnectedUser)

export default User
