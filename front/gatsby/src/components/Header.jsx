import React from 'react'
import { HelpCircle, LogOut } from 'react-feather'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import styles from './header.module.scss'

// Gestionnaire d'état (quel user est enregistré, enregistré ou non, etc.)
const mapStateToProps = ({ logedIn, activeUser, applicationConfig }) => {
  return { logedIn, activeUser, applicationConfig }
}

const ConnectedHeader = (props) => {
  const nav = props.logedIn ? (
    <>
      <li><Link to="/credentials">{props.activeUser.displayName}</Link></li>
      <li><Link to="/books">Books</Link></li>
      <li><Link to="/articles">Articles</Link></li>
      <li><a
        href={props.applicationConfig.backendEndpoint + '/logout'}
        className={styles.logoutAction}
      >
        Log out
        <LogOut className={styles.linkIcon} size={14} />
      </a></li>
    </>
  ) : (
    <>
      <li><Link to="/">Login</Link></li>
      <li><Link to="/register" className={styles.registerAction}>
        Register
      </Link></li>
    </>
  )

  return (
    <header className={props.className}>
      <section className={styles.header}>
        <h1 className={styles.logo}>
          <Link to="/">Stylo</Link>
        </h1>
        <nav>
          <ul className={styles.menuLinks}>
            {nav}
            <li className={styles.documentationLink}><a
              href="http://stylo-doc.ecrituresnumeriques.ca"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HelpCircle className={styles.linkIcon}size={14} />
              Documentation
            </a></li>
          </ul>
        </nav>
      </section>
    </header>
  )
}

const Header = connect(mapStateToProps)(ConnectedHeader)
export default Header
