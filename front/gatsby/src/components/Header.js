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
                <h1>_Stylo_</h1>
                <nav>
                    <a href="http://stylo-doc.ecrituresnumeriques.ca/" target="_blank" rel="noopener noreferrer">Documentation</a>
                    <a href="https://github.com/EcrituresNumeriques/stylo/issues" target="_blank" rel="noopener noreferrer">Report an issue</a>
                    {props.logedIn && <>
                        <p>{JSON.stringify(props.users.map(u => u.displayName))}</p>
                        <p>{JSON.stringify(props.password.username)}</p>
                    </>}
                    {!props.logedIn && <Link to="/login">Login</Link>}
                    {!props.logedIn && <Link to="/register">Register</Link>}
                    {props.logedIn && <p onClick={()=>props.logout()}>Log out</p>}
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