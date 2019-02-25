import React, { useState } from "react"
import { Link, navigate } from "gatsby"
import { connect } from "react-redux"

import etv from '../helpers/eventTargetValue'
import validateEmail from '../helpers/validationEmail'

import styles from './register.module.scss'

const mapStateToProps = ({ logedIn }) => {
    return { logedIn }
}

const ConnectedRegister = (props) => {
    if(props.logedIn){
        navigate('/articles')
    }

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordC, setPasswordC] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [institution, setInstitution] = useState('');

    let user = {email, username, password, passwordC, displayName, firstName, lastName, institution}

    return (
        <section className={styles.box}>
            <form onSubmit={(event)=>{event.preventDefault();console.log(user)}}>
                <h1>Required</h1>
                <input type="text" placeholder="Email*" className={validateEmail(email)?null:styles.beware} value={email} onChange={(e)=>setEmail(etv(e))}/>
                <input type="text" placeholder="Username*" value={username} onChange={(e)=>setUsername(etv(e))}/>
                <input type="password" placeholder="Password*" value={password} onChange={(e)=>setPassword(etv(e))}/>
                <input type="password" placeholder="Confirm password*" className={password === passwordC?null:styles.beware} value={passwordC} onChange={(e)=>setPasswordC(etv(e))}/>
                <h1>Optional</h1>
                <input type="text" placeholder="Display Name" value={displayName} onChange={(e)=>setDisplayName(etv(e))}/>
                <input type="text" placeholder="First Name" value={firstName} onChange={(e)=>setFirstName(etv(e))}/>
                <input type="text" placeholder="Last Name" value={lastName} onChange={(e)=>setLastName(etv(e))}/>
                <input type="text" placeholder="Institution" value={institution} onChange={(e)=>setInstitution(etv(e))}/>
                <input type="submit" value="Create"/>
                <p className="note">or <Link to="/login">login</Link></p>
            </form>
        </section> 
    )
}

const Register = connect(
    mapStateToProps
)(ConnectedRegister)
export default Register