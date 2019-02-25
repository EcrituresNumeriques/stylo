import React from "react"
import { Link, navigate } from "gatsby"
import { connect } from "react-redux"

import styles from './login.module.scss'

const mapStateToProps = ({ logedIn }) => {
    return { logedIn }
}

const ConnectedLogin = (props) => {
    if(props.logedIn){
        navigate('/articles')
    }
    return (
        <section className={styles.box}>
            <form onSubmit={(event)=>{event.preventDefault();console.log('clicked')}}>
                <h1>Login</h1>
                <input type="text" placeholder="email or username"/>
                <input type="password" placeholder="password"/>
                <input type="submit" value="go"/>
                <p className="note">or <Link to="/register">create an account</Link></p>
            </form>
        </section> 
    )
}

const Login = connect(
    mapStateToProps
)(ConnectedLogin)
export default Login