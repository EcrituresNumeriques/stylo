import React from "react"
import { Link, navigate } from "gatsby"
import { connect } from "react-redux"

import styles from './register.module.scss'

const mapStateToProps = ({ logedIn }) => {
    return { logedIn }
}

const ConnectedRegister = (props) => {
    if(props.logedIn){
        navigate('/articles')
    }
    return (
        <section className={styles.box}>
            <form onSubmit={(event)=>{event.preventDefault();console.log('clicked')}}>
                <input type="text" placeholder="Email*"/>
                <input type="text" placeholder="Username*"/>
                <input type="password" placeholder="Password*"/>
                <input type="password" placeholder="Confirm password*"/>
                <hr/>
                <input type="text" placeholder="Display Name"/>
                <input type="text" placeholder="First Name"/>
                <input type="text" placeholder="Last Name"/>
                <input type="text" placeholder="Institution"/>
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