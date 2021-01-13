import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import styles from './header.module.scss'

// Gestionnaire d'état (quel user est enregistré, enregistré ou non, etc.)
const mapStateToProps = ({ logedIn, activeUser, applicationConfig }) => {
  return { logedIn, activeUser, applicationConfig }
}

const Header = (props) => {
  const backendEndpoint = props.applicationConfig.backendEndpoint
  const nav = props.logedIn ? (
    <>
      <Link to="/credentials">{props.activeUser.displayName}</Link>
      <Link to="/books">Books</Link>
      <Link to="/articles">Articles</Link>
      <a
        href={backendEndpoint + '/logout'}
        className={styles.logoutAction}
      >
        Log out
      </a>
    </>
  ) : (
    <>
      <Link to="/">Login</Link>
      <Link to="/register" className={styles.registerAction}>
        Register
      </Link>
    </>
  )

  return (
    <header className={props.className}>
      <section className={styles.header}>
        <h1>
          <Link to="/">_Stylo_</Link>
        </h1>
        <nav>
          {nav}
          <a
            href="http://stylo-doc.ecrituresnumeriques.ca"
            className={styles.documentationLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </nav>
      </section>
    </header>
  )
}

export default connect(mapStateToProps)(Header)
