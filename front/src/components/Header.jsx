import React from 'react'
import { User } from 'react-feather'
import { useSelector } from 'react-redux'
import { Link, Route, Switch } from 'react-router-dom'
import logoContent from '../../public/images/logo.svg?inline'

import Button from './Button'

import styles from './header.module.scss'
import UserMenu from "./header/UserMenu.jsx";

function Header () {
  const logedIn = useSelector(state => state.logedIn)
  const displayName = useSelector(state => state.activeUser.displayName)

  return (<Switch>
    <Route path="*/preview"/>
    <Route path="*">
      <header className={styles.headerContainer}>
        <section className={styles.header}>
          <h1 className={styles.logo}>
            <Link to="/"><img src={logoContent} alt="Stylo" title="Stylo"/></Link>
          </h1>
          {logedIn &&
            <>
              <nav>
                <ul className={styles.menuLinks}>
                  <li><Link to="/articles">Articles</Link></li>
                  <li><Link to="/books">Books</Link></li>
                </ul>
              </nav>
              <nav>
                <ul className={styles.menuLinks}>
                  <li><UserMenu/></li>
                </ul>
              </nav>
            </>
          }
          {!logedIn &&
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
