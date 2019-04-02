import React,{useState, useEffect} from 'react'
import {navigate} from 'gatsby'
import { connect } from "react-redux"

import askGraphQL from '../helpers/graphQL';
import etv from '../helpers/eventTargetValue'
import styles from './user.module.scss'
import UserConnectedLogin from './UserAllowedLogin'


const mapStateToProps = ({ logedIn, activeUser, sessionToken }) => {
  return { logedIn, activeUser, sessionToken }
}
const mapDispatchToProps = dispatch => {
  return { 
      updateActiveUser: (displayName) => dispatch({ type: `UPDATE_ACTIVE_USER`, payload: displayName })
  }
}

const ConnectedUser = props => {    
  const isBrowser = typeof window !== 'undefined';
  if(isBrowser && !props.logedIn){
    navigate('/login')
    return <p>redirecting</p>
  }


  const [displayNameH1,setDisplayNameH1] = useState(props.activeUser.displayName)
  const [displayName,setDisplayName] = useState('')
  const [firstName,setFirstName] = useState('')
  const [lastName,setLastName] = useState('')
  const [institution,setInstitution] = useState('')
  const [yaml,setYaml] = useState('')
  const [user,setUser] = useState({email:'',_id:'',admin:false,createdAt:'',updatedAt:''})
  const [passwords, setPasswords] = useState([])
  const [tokens, setTokens] = useState([])
  const [isLoading,setIsLoading] = useState(true)
  const [emailLogin,setEmailLogin] = useState('')

  
  useEffect(()=>{
    (async ()=>{
      try{
        const query = `query($user:ID!){user(user:$user){ displayName _id email admin createdAt updatedAt yaml firstName lastName institution passwords{ _id username email } tokens{ _id name active }}}`
        const variables = {user:props.activeUser._id}
        const data = await askGraphQL({query,variables},'fetching user',props.sessionToken)
        setDisplayNameH1(data.user.displayName)
        setDisplayName(data.user.displayName)
        setFirstName(data.user.firstName || '')
        setLastName(data.user.lastName || '')
        setInstitution(data.user.institution || '')
        setYaml(data.user.yaml)
        setPasswords(data.user.passwords)
        setTokens(data.user.tokens)
        setUser(data.user)
        setIsLoading(false)
      }
      catch(err){
        alert(`couldn't fetch user ${err}`)
      }
    })()
  },[])

  const updateInfo = async (e) => {
    e.preventDefault();
    try{
      setIsLoading(true)
      const query = `mutation($user:ID!,$displayName:String!,$firstName:String,$lastName:String, $institution:String,$yaml:String){updateUser(user:$user,displayName:$displayName,firstName:$firstName, lastName: $lastName, institution:$institution, yaml:$yaml){ displayName _id email admin createdAt updatedAt yaml firstName lastName institution passwords{ _id username email } tokens{ _id name active }}}`
      const variables = {user:props.activeUser._id,yaml,displayName,firstName,lastName,institution}
      const data = await askGraphQL({query,variables},'updating user',props.sessionToken)
      setDisplayNameH1(data.updateUser.displayName)
      setDisplayName(data.updateUser.displayName)
      props.updateActiveUser(displayName)
      setFirstName(data.updateUser.firstName || '')
      setLastName(data.updateUser.lastName || '')
      setInstitution(data.updateUser.institution || '')
      setYaml(data.updateUser.yaml)
      setPasswords(data.updateUser.passwords)
      setTokens(data.updateUser.tokens)
      setUser(data.updateUser)
      setIsLoading(false)
    }
    catch(err){
      alert(`Couldn't update User: ${err}`)
    }

  }

  const addNewLogin = async (e) => {
    e.preventDefault();
    try{
      const query = `mutation($user:ID!,$email:String!){
        addCredential(email:$email,user:$user){
          passwords{
            _id
            email
            username
          }
        }
      }`
      const variables = {email:emailLogin,user:props.activeUser._id}
      const data = await askGraphQL({query,variables},'Adding password to user',props.sessionToken)
      setPasswords(data.addCredential.passwords)
    }
    catch(err){
      alert(err)
    }
  }

  const removeLogin = async (email) => {
    try{
      const query = `mutation($user:ID!,$email:String!){
        removeCredential(email:$email,user:$user){
          passwords{
            _id
            email
            username
          }
        }
      }`
      const variables = {email:email,user:props.activeUser._id}
      const data = await askGraphQL({query,variables},'Removing password to user',props.sessionToken)
      setPasswords(data.removeCredential.passwords)
    }
    catch(err){
      alert(err)
    }
  }

  return(
    <section className={styles.section}>
      <h1>User management ({displayNameH1})</h1>

      <h2>User information</h2>
      <form onSubmit={(e)=>updateInfo(e)}>
        <label>Information: </label><p>{isLoading?'fetching..':'up to date'}</p>
        <label>Email:</label><p>{user.email}</p>
        <label>ID:</label><p>{user._id}</p>
        <label>Status:</label><p>{user.admin?'Admin':'User'}</p>
        <label>Created At:</label><p>{user.createdAt}</p>
        <label>Updated At:</label><p>{user.updatedAt}</p>
        <label>Display name:</label><input type="text" value={displayName} onChange={(e)=>setDisplayName(etv(e))} placeholder="Display name" />
        <label>First Name:</label><input type="text" value={firstName} onChange={(e)=>setFirstName(etv(e))} placeholder="First name" />
        <label>Last name:</label><input type="text" value={lastName} onChange={(e)=>setLastName(etv(e))} placeholder="Last name" />
        <label>Institution:</label><input type="text" value={institution} onChange={(e)=>setInstitution(etv(e))} placeholder="Institution name" />
        <label>Default YAML:</label><textarea value={yaml} onChange={(e)=>setYaml(etv(e))} placeholder="" />
        <div className={styles.rightAlign}><button>Update</button></div>
        
      </form>
      <h2>Logins allowed</h2>
      <ul>
        {isLoading && <li>Fetching..</li>}
        {!isLoading && passwords.map(p=><UserConnectedLogin key={`userLogin-${p._id}`} {...p} user={user.email} removeLogin={removeLogin}/>)}
      </ul>
      <form onSubmit={(e)=>addNewLogin(e)}>
        <input placeholder="Email of the login to allow" value={emailLogin} onChange={(e)=>setEmailLogin(etv(e))}/>
        <button>Give full access</button>
      </form>
      <h2>Tokens allowed</h2>
      <ul>
        {isLoading && <li>Fetching..</li>}
        {!isLoading && tokens.map(p=><li>{p._id} {p.username}</li>)}
      </ul>    
    </section>
  )
}

const User = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedUser)

export default User