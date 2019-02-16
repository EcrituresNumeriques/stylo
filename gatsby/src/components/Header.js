import React, { useState } from "react"
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

const ConnectedCounter = connect(
    mapStateToProps,
    mapDispatchToProps
)(Header)


const Header = (props) => {
    
    return (
        <header className={`${styles.header} ${props.className}`}>
            <Link to="/centered">Centered</Link>
            <Link to="/wrapped">Wrapped</Link>
            <Link to="/fullPage">fullPage</Link>
            Headerino
        </header> 
    )
}

export default ConnectedCounter