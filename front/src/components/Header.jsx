import React from 'react'
import { LifeBuoy } from 'react-feather'
import { useSelector } from 'react-redux'
import { Link, Route, Switch } from 'react-router-dom'

import logoContent from '../../public/images/logo.svg?inline'

import styles from './header.module.scss'
import UserMenu from './header/UserMenu.jsx'

function Header () {
  const connected = useSelector(state => state.logedIn)

  return (<Switch>
    <Route path="*/preview"/>
    <Route path="*">
      <header className={styles.headerContainer}>
        <section className={styles.header}>
          <h1 className={styles.logo}>
            <Link to="/"><img src={logoContent} alt="Stylo" title="Stylo"/></Link>
          </h1>
          {connected &&
            <>
              <nav>
                <ul className={styles.menuLinks}>
                  <li><Link to="/articles">Articles</Link></li>
                  <li><Link to="/books">Corpus</Link></li>
                </ul>
              </nav>
              <nav className={styles.secondaryNav}>
                <UserMenu/>
                <a className={styles.documentationLink}
                   href="https://stylo-doc.ecrituresnumeriques.ca"
                   target="_blank"
                   rel="noopener noreferrer"
                >
                  <LifeBuoy size={16}/>
                  Documentation
                </a>
              </nav>
            </>
          }
          {!connected &&
            <nav>
              <ul className={styles.menuLinks}>
                <li><Link to="/">Login</Link></li>
                <li><Link to="/register" className={styles.registerAction}>Register</Link></li>
              </ul>
            </nav>
          }
        </section>
      </header>
    </Route>
  </Switch>)
}

export default Header
