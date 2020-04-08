import React, {useState, useEffect} from 'react'
import {navigate} from 'gatsby'
import { connect } from "react-redux"

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

const withLogin = props => {
    const isBrowser = typeof window !== 'undefined';
    if(isBrowser && !props.logedIn){
        navigate('/login')
        return <p>redirecting</p>
    }
    return <ConnectedCredentials {...props}/>
}

const ConnectedCredentials = props => {
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

    const [isLoading,setIsLoading] = useState(true)
    const [_,setIsUpdating] = useState(false)

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
        </section>
    )
}


const Credentials = connect(
    mapStateToProps,
    mapDispatchToProps
)(withLogin)

export default Credentials