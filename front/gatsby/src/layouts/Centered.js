import React from "react"
import SEO from '../components/SEO'
import Header from '../components/Header'

import styles from './centered.module.scss'

const Layout = (props) => (
    <main className={`${styles.grid}`}>
        <SEO {...props}/>
        <Header className={styles.header}/>
        <main className={`${styles.main}`}>
            {props.children}
        </main>
    </main>
)

export default Layout