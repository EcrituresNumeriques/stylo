import React from 'react'
import { connect } from "react-redux"

import askGraphQL from '../helpers/graphQL';
import styles from './userAllowedLogin.module.scss'


const mapStateToProps = ({ logedIn, activeUser, sessionToken }) => {
  return { logedIn, activeUser, sessionToken }
}

const mapDispatchToProps = dispatch => {
  return { 
      RemoveAllowedLogin: (login) => dispatch({ type: `REMOVE_ALLOWED_LOGIN`, payload: login })
  }
}


const ConnectedUserAllowedLogin = props => {

  return (
    <li className={styles.resetFloat}>
      {props.user !== props.email && <button className={styles.button} onDoubleClick={()=>props.removeLogin(props.email,props._id)}>Revoke access</button>}
      {props.email}
    </li>
  )
}

const UserAllowedLogin = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedUserAllowedLogin)

export default UserAllowedLogin