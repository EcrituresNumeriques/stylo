import React from "react"
import { Link } from "gatsby"
import { connect } from "react-redux"

import styles from './header.module.scss'

const mapStateToProps = ({ logedIn }) => {
    return { logedIn }
}

const mapDispatchToProps = dispatch => {
    return { 
        login: () => dispatch({ type: `LOGIN` }),
        logout: () => dispatch({ type: `LOGOUT` })
    }
}



const ConnectedHeader = (props) => {
    return (
        <header className={props.className}>
            <section className={styles.header}>
                <h1>_Stylo_</h1>
                <nav>
                    {props.logedIn && <p onClick={()=>props.logout()}>Log out</p>}
                    {!props.logedIn && <p onClick={()=>props.login()}>Log in</p>}
                    <a href="http://stylo-doc.ecrituresnumeriques.ca/" target="_blank" rel="noopener noreferrer">Documentation</a>
                    <a href="https://github.com/EcrituresNumeriques/stylo/issues" target="_blank" rel="noopener noreferrer">Report an issue</a>
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