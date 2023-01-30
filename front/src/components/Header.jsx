import React from 'react'
import { HelpCircle, LogOut } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Route, Switch } from 'react-router-dom'
import logoContent from '../../public/images/logo.svg?inline'

import Button from './Button'

import styles from './header.module.scss'

function Header () {
  const dispatch = useDispatch()
  const logout = () => dispatch({ type: 'LOGOUT' })
  const logedIn = useSelector(state => state.logedIn)
  const displayName = useSelector(state => state.activeUser.displayName)

  const nav = logedIn ? (
    <>
      <li><Link to="/articles">Articles</Link></li>
      <li><Link to="/books">Books</Link></li>
      <li><Link to="/credentials">My Account</Link></li>
      <li>
        <Button onClick={logout} link>
          Log out
          <LogOut className={styles.linkIcon} size={14} />
        </Button>
      </li>
    </>
  ) : (
    <>
      <li><Link to="/">Login</Link></li>
      <li><Link to="/register" className={styles.registerAction}>
        Register
      </Link></li>
    </>
  )

  return (<Switch>
    <Route path="*/preview" />
    <Route path="*">
      <header className={styles.headerContainer}>
        <section className={styles.header}>
          <h1 className={styles.logo}>
            <Link to="/"><img src={logoContent} alt="Stylo" title="Stylo"/></Link>
          </h1>
          <nav>
            <ul className={styles.menuLinks}>
              {nav}
              <li className={styles.documentationLink}><a
                href="http://stylo-doc.ecrituresnumeriques.ca"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HelpCircle className={styles.linkIcon} size={14} />
                Documentation
              </a></li>
            </ul>
          </nav>
        </section>
      </header>
    </Route>
  </Switch>)
}

export default Header
