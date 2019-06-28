import React, {useState, useEffect} from 'react'
import {navigate} from 'gatsby'
import { connect } from "react-redux"

import etv from '../helpers/eventTargetValue'
import askGraphQL from '../helpers/graphQL';
import styles from './credentials.module.scss'
import CredentialsUserSelect from './CredentialsUserSelect'

const mapStateToProps = ({ logedIn, users, activeUser, sessionToken, password }) => {
    return { logedIn, users, activeUser, sessionToken, password }
}
const mapDispatchToProps = dispatch => {
    return { 
        switchUser: (u) => dispatch({ type: `SWITCH`, payload: u }),
        updateUser: (u) => dispatch({type: 'RELOAD_USERS', payload: u})
    }
}


const ConnectedCredentials = props => {
    const isBrowser = typeof window !== 'undefined';
    if(isBrowser && !props.logedIn){
        navigate('/login')
        return <p>redirecting</p>
    }

    useEffect(()=>{
        (async ()=>{
          try{
            const query = "query{ refreshToken{ users { _id displayName email } } }"
            const data = await askGraphQL({query},'fetching user',props.sessionToken)
            props.updateUser(data.refreshToken.users)
            setIsLoading(false)
          }
          catch(err){
            alert(`couldn't fetch users ${err}`)
          }
        })()
      },[])

    const [passwordO, setPasswordO] = useState('');
    const [password, setPassword] = useState('');
    const [passwordC, setPasswordC] = useState('');
    const [isLoading,setIsLoading] = useState(true)
    const [isUpdating,setIsUpdating] = useState(false)

    const changePassword = async (e) => {
        e.preventDefault();
        try{
            setIsUpdating(true)
            const query = `mutation($password:ID!, $old:String!, $new:String!, $user:ID!){ changePassword(password:$password,old:$old,new:$new,user:$user){ _id } }`
            const variables = {password:props.password._id, old: passwordO, new:password, user: props.activeUser._id}
            const data = await askGraphQL({query, variables},'update Password',props.sessionToken)
            setPassword('')
            setPasswordO('')
            setPasswordC('')
            setIsUpdating(false)
        }
        catch(err){
            alert(err)
        }
    }

    const setDefault = async (user) => {
        try{
            setIsUpdating(true)
            const query = `mutation($password:ID!, $user:ID!){ setPrimaryUser(password:$password,user:$user){ users { _id displayName email } } }`
            const variables = {password:props.password._id, user: user}
            const data = await askGraphQL({query, variables},'Set user as default',props.sessionToken)
            setIsUpdating(false)
            props.updateUser(data.setPrimaryUser.users)
        }
        catch(err){
            alert(err)
        }
    }

    return(
        <section className={styles.section}>
            <h1>Account selection</h1>
            <p>If your <strong>Credentials</strong> are associated with multiple <strong>Accounts</strong>, you'll be able to set active account and default active Account here ({isLoading?'fetching..':'up to date'})</p>
            <ul>
                {props.users.map((u,i)=><CredentialsUserSelect key={`user-${u._id}`} {...props} u={u} setDefault={setDefault}/>)}
            </ul>
            <h2>Change password</h2>
            <p>This section is strictly private, changing your password will only affect your combination of username/email and password. Other users having access to one or more of your available accounts won't be affected.</p>
            <form onSubmit={(e)=>changePassword(e)}>
                <input type="password" placeholder="Old password" value={passwordO} onChange={(e)=>setPasswordO(etv(e))}/>
                <input type="password" placeholder="New password" value={password} onChange={(e)=>setPassword(etv(e))}/>
                <input type="password" placeholder="Confirm new password" className={password === passwordC?null:styles.beware} value={passwordC} onChange={(e)=>setPasswordC(etv(e))}/>
                <button disabled={!password || !passwordO || (password !== passwordC)}>{isUpdating?'Updating..':'Change'}</button>
            </form>
            

        </section>
    )
}


const Credentials = connect(
    mapStateToProps,
    mapDispatchToProps
)(ConnectedCredentials)

export default Credentials