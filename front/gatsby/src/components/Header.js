import React from "react"
import { Link } from "gatsby"
import { connect } from "react-redux"
import env from '../helpers/env'

import styles from './header.module.scss'

// Gestionnaire d'état (quel user est enregistré, enregistré ou non, etc.)
const mapStateToProps = ({ logedIn, password, activeUser }) => {
    return { logedIn, password, activeUser }
}



const ConnectedHeader = (props) => {
    return (
        <header className={props.className}>
            <section className={styles.header}>
                <h1><Link to='/'>_Stylo_</Link></h1>
                <nav>
                    {props.logedIn && <>
                        <Link to='/credentials'>{props.activeUser.displayName}</Link>
                        <Link to='/books'>Books</Link>
                        <Link to='/articles'>Articles</Link>
                        <a href={env.BACKEND_ENDPOINT + '/logout'}>Log out</a>
                    </>}
                    <a href='http://stylo-doc.ecrituresnumeriques.ca' target='_blank' rel='noopener noreferrer'>Documentation</a>
                    {!props.logedIn && <Link to="/login">Login</Link>}
                    {!props.logedIn && <Link to="/register">Register</Link>}
                </nav>
            </section>
        </header>
    )
}

const Header = connect(
    mapStateToProps,
)(ConnectedHeader)
export default Header
