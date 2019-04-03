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
    const [isUpdating,setIsUpdatinng] = useState(false)

    const changePassword = async (e) => {
        e.preventDefault();
        try{
            setIsUpdatinng(true)
            const query = `mutation($password:ID!, $old:String!, $new:String!, $user:ID!){ changePassword(password:$password,old:$old,new:$new,user:$user){ _id } }`
            const variables = {password:props.password._id, old: passwordO, new:password, user: props.activeUser._id}
            const data = await askGraphQL({query, variables},'update Password',props.sessionToken)
            setPassword('')
            setPasswordO('')
            setPasswordC('')
            setIsUpdatinng(false)
        }
        catch(err){
            alert(err)
        }
    }

    return(
        <section className={styles.section}>
            <h1>Credentials management</h1>
            <p>This section is strictly private, information are only related to your credentials, the combination of username(or email) and password</p>
            <h2>Change password</h2>
            <form onSubmit={(e)=>changePassword(e)}>
                <input type="password" placeholder="Old password" value={passwordO} onChange={(e)=>setPasswordO(etv(e))}/>
                <input type="password" placeholder="New password" value={password} onChange={(e)=>setPassword(etv(e))}/>
                <input type="password" placeholder="Confirm new password" className={password === passwordC?null:styles.beware} value={passwordC} onChange={(e)=>setPasswordC(etv(e))}/>
                <button disabled={!password || !passwordO || (password !== passwordC)}>{isUpdating?'Updating..':'Change'}</button>
            </form>
            <h2>User selection</h2>
            <p>If your <strong>Credentials</strong> are associated with multiple <strong>Users</strong>, you'll be able to set active user and default active User here ({isLoading?'fetching..':'up to date'})</p>
            <ul>
                {props.users.map((u,i)=><CredentialsUserSelect key={`user-${u._id}`} {...props} u={u}/>)}
            </ul>

        </section>
    )
}


const Credentials = connect(
    mapStateToProps,
    mapDispatchToProps
)(ConnectedCredentials)

export default Credentials