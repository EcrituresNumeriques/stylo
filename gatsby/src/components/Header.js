import React, { useState } from "react"
import { Link } from "gatsby"

import styles from './header.module.scss'

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

export default Header