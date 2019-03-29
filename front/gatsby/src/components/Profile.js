import React, {useState} from 'react'
import {navigate} from 'gatsby'
import { connect } from "react-redux"

import etv from '../helpers/eventTargetValue'
import styles from './profile.module.scss'
import ProfileUserSelect from './ProfileUserSelect'

const mapStateToProps = ({ logedIn, users, activeUser, sessionToken }) => {
    return { logedIn, users, activeUser, sessionToken }
}
const mapDispatchToProps = dispatch => {
    return { 
        switchUser: (u) => dispatch({ type: `SWITCH`, data: u })
    }
}


const ConnectedProfile = props => {
    const isBrowser = typeof window !== 'undefined';
    if(isBrowser && !props.logedIn){
        navigate('/login')
        return <p>redirecting</p>
    }

    const [passwordO, setPasswordO] = useState('');
    const [password, setPassword] = useState('');
    const [passwordC, setPasswordC] = useState('');
    return(
        <section className={styles.section}>
            <h1>Login management</h1>
            <p>This section is strictly private, information are only related to your combination of username(or email) and password</p>
            <h2>User selection</h2>
            <p>If your <strong>Login</strong> is associated with multiple <strong>Users</strong>, you'll be able to set active user and default active User here</p>
            <ul>
                {props.users.map((u,i)=><ProfileUserSelect key={`user-${u._id}`} {...props} u={u}/>)}
            </ul>
            <h2>Change password</h2>
            <form>
                <input type="password" placeholder="Old password" value={passwordO} onChange={(e)=>setPasswordO(etv(e))}/>
                <input type="password" placeholder="New password" value={password} onChange={(e)=>setPassword(etv(e))}/>
                <input type="password" placeholder="Confirm new password" className={password === passwordC?null:styles.beware} value={passwordC} onChange={(e)=>setPasswordC(etv(e))}/>
                <button disabled={!password || !passwordO || (password !== passwordC)}>Change</button>
            </form>

        </section>
    )
}


const Profile = connect(
    mapStateToProps,
    mapDispatchToProps
)(ConnectedProfile)

export default Profile