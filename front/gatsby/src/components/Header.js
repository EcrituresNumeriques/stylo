import React from "react"
import { Link } from "gatsby"
import { connect } from "react-redux"

import styles from './header.module.scss'

const mapStateToProps = ({ logedIn, password, users }) => {
    return { logedIn, password, users }
}

const mapDispatchToProps = dispatch => {
    return { 
        logout: () => dispatch({ type: `LOGOUT` })
    }
}



const ConnectedHeader = (props) => {
    return (
        <header className={props.className}>
            <section className={styles.header}>
                <h1><Link to='/'>_Stylo_</Link></h1>
                <nav>
                    {props.logedIn && <>
                        <Link to='/users'>{JSON.stringify(props.users.map(u => u.displayName))}</Link>
                        <Link to='/profile'>{props.password.username}</Link>
                        <Link to='/books'>My Books</Link>
                        <Link to='/articles'>My Articles</Link>
                        <p onClick={()=>props.logout()}>Log out</p>
                    </>}
                    {!props.logedIn && <Link to="/login">Login</Link>}
                    {!props.logedIn && <Link to="/register">Register</Link>}
                </nav>
            </section>
        </header> 
    )
}

const Header = connect(
    mapStateToProps,
    mapDispatchToProps
)(ConnectedHeader)
export default Header