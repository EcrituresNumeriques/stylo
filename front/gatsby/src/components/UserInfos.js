import React, { useState, useEffect } from 'react'
import { navigate } from 'gatsby'
import { connect } from 'react-redux'

import askGraphQL from '../helpers/graphQL'
import etv from '../helpers/eventTargetValue'
import styles from './userInfos.module.scss'
import UserConnectedLogin from './UserAllowedLogin'

const mapStateToProps = ({ password, activeUser, sessionToken }) => {
  return { password, activeUser, sessionToken }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateActiveUser: (displayName) =>
      dispatch({ type: `UPDATE_ACTIVE_USER`, payload: displayName }),
    removedMyself: (_id) =>
      dispatch({ type: 'REMOVE_MYSELF_ALLOWED_LOGIN', payload: _id }),
    clearZoteroToken: () => dispatch({ type: 'CLEAR_ZOTERO_TOKEN' }),
  }
}

const ConnectedUser = (props) => {
  const [displayName, setDisplayName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [institution, setInstitution] = useState('')
  const [yaml, setYaml] = useState('')
  const [user, setUser] = useState({
    email: '',
    _id: '',
    admin: false,
    createdAt: '',
    updatedAt: '',
    zoteroToken: '',
    zoteroUsername: '',
  })
  const [passwords, setPasswords] = useState([])
  //const [tokens, setTokens] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [emailLogin, setEmailLogin] = useState('')
  const { clearZoteroToken } = props

  useEffect(() => {
    ;(async () => {
      try {
        const query = `query($user:ID!){user(user:$user){ displayName _id email admin createdAt updatedAt yaml firstName zoteroToken lastName institution passwords{ _id username email } tokens{ _id name active }}}`
        const variables = { user: props.activeUser._id }
        const data = await askGraphQL(
          { query, variables },
          'fetching user',
          props.sessionToken
        )
        //setDisplayNameH1(data.user.displayName)
        setDisplayName(data.user.displayName)
        setFirstName(data.user.firstName || '')
        setLastName(data.user.lastName || '')
        setInstitution(data.user.institution || '')
        setYaml(data.user.yaml)
        setPasswords(data.user.passwords)
        //setTokens(data.user.tokens)
        setUser(data.user)
        setIsLoading(false)
      } catch (err) {
        alert(`couldn't fetch user ${err}`)
      }
    })()
  }, [])

  const unlinkZoteroAccount = async () => {
    const query = `mutation($user:ID!,$zoteroToken:String){updateUser(user:$user, zoteroToken:$zoteroToken){ displayName _id email admin createdAt updatedAt yaml firstName lastName institution zoteroToken passwords{ _id username email } tokens{ _id name active } }}`
    const variables = { user: props.activeUser._id, zoteroToken: null }
    setIsLoading(true)
    const data = await askGraphQL(
      { query, variables },
      'clear Zotero Token',
      props.sessionToken
    )
    setUser(data.updateUser)
    clearZoteroToken()
    setIsLoading(true)
  }

  const updateInfo = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const query = `mutation($user:ID!,$displayName:String!,$firstName:String,$lastName:String, $institution:String,$yaml:String){updateUser(user:$user,displayName:$displayName,firstName:$firstName, lastName: $lastName, institution:$institution, yaml:$yaml){ displayName _id email admin createdAt updatedAt yaml firstName lastName institution zoteroToken passwords{ _id username email } tokens{ _id name active }}}`
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
        props.sessionToken
      )
      //setDisplayNameH1(data.updateUser.displayName)
      setDisplayName(data.updateUser.displayName)
      props.updateActiveUser(displayName)
      setFirstName(data.updateUser.firstName || '')
      setLastName(data.updateUser.lastName || '')
      setInstitution(data.updateUser.institution || '')
      setYaml(data.updateUser.yaml)
      setPasswords(data.updateUser.passwords)
      //setTokens(data.updateUser.tokens)
      setUser(data.updateUser)
      setIsLoading(false)
    } catch (err) {
      alert(`Couldn't update User: ${err}`)
    }
  }

  const addNewLogin = async (e) => {
    e.preventDefault()
    try {
      const query = `mutation($user:ID!,$email:String!){
        addCredential(email:$email,user:$user){
          passwords{
            _id
            email
            username
          }
        }
      }`
      const variables = { email: emailLogin, user: props.activeUser._id }
      const data = await askGraphQL(
        { query, variables },
        'Adding password to user',
        props.sessionToken
      )
      setEmailLogin('')
      setPasswords(data.addCredential.passwords)
    } catch (err) {
      alert(err)
    }
  }

  const removeLogin = async (email, _id) => {
    try {
      const query = `mutation($user:ID!,$email:String!){
        removeCredential(email:$email,user:$user){
          passwords{
            _id
            email
            username
          }
        }
      }`
      const variables = { email: email, user: props.activeUser._id }
      const data = await askGraphQL(
        { query, variables },
        'Removing password to user',
        props.sessionToken
      )
      setPasswords(data.removeCredential.passwords)

      // User removed itself from allowedCredentials
      if (props.password._id === _id) {
        //user._id
        props.removedMyself(user._id)
        navigate('/credentials')
      }
    } catch (err) {
      alert(err)
    }
  }

  return (
    <section className={styles.section}>
      <h2>Account information</h2>
      <form onSubmit={(e) => updateInfo(e)}>
        <label>Display name:</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(etv(e))}
          placeholder="Display name"
        />
        <label>First Name:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(etv(e))}
          placeholder="First name"
        />
        <label>Last name:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(etv(e))}
          placeholder="Last name"
        />
        <label>Institution:</label>
        <input
          type="text"
          value={institution}
          onChange={(e) => setInstitution(etv(e))}
          placeholder="Institution name"
        />
        <label>Zotero:</label>
        <p>
          {user.zoteroToken ? (
            <span>
              Linked with <b>{user.zoteroToken}</b> account.
            </span>
          ) : (
            <span>No linked account.</span>
          )}
          {user.zoteroToken && (
            <button
              title="Unlink this Zotero account"
              onClick={(e) => e.preventDefault() || unlinkZoteroAccount()}
            >
              Unlink
            </button>
          )}
        </p>
        <label>Default YAML:</label>
        <textarea
          value={yaml}
          onChange={(e) => setYaml(etv(e))}
          placeholder=""
        />
        <div className={styles.rightAlign}>
          <button>Update</button>
        </div>
        <label>Primary email:</label>
        <p>{user.email}</p>
        <label>ID:</label>
        <p>{user._id}</p>
        <label>Status:</label>
        <p>{user.admin ? 'Admin' : 'Basic account'}</p>
        <label>Created At:</label>
        <p>{user.createdAt}</p>
        <label>Updated At:</label>
        <p>{user.updatedAt}</p>
      </form>
      <h2>Allowed credentials</h2>
      <ul>
        {isLoading && <li>Fetching..</li>}
        {!isLoading &&
          passwords.map((p) => (
            <UserConnectedLogin
              key={`userLogin-${p._id}`}
              {...p}
              user={user.email}
              removeLogin={removeLogin}
            />
          ))}
      </ul>
      <form onSubmit={(e) => addNewLogin(e)} id={styles.newLogin}>
        <input
          placeholder="Email of the login to allow"
          value={emailLogin}
          onChange={(e) => setEmailLogin(etv(e))}
        />
        <div className={styles.rightAlign}>
          <button>Give full access</button>
        </div>
      </form>
    </section>
  )
}

const User = connect(mapStateToProps, mapDispatchToProps)(ConnectedUser)

export default User
