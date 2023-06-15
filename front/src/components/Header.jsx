import React, { useEffect, useMemo } from 'react'
import { LifeBuoy } from 'react-feather'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Route, Switch, useParams } from 'react-router-dom'

import logoContent from '../../public/images/logo.svg?inline'
import { useActiveWorkspace } from '../hooks/workspace.js'

import styles from './header.module.scss'
import UserMenu from './header/UserMenu.jsx'

function Header () {
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = useMemo(() => activeWorkspace?._id, [activeWorkspace])
  const connected = useSelector(state => state.loggedIn)

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
                  <li><Link to={activeWorkspaceId ? `/workspaces/${activeWorkspaceId}/articles` : '/articles'}>Articles</Link></li>
                  <li><Link to={activeWorkspaceId ? `/workspaces/${activeWorkspaceId}/books` : '/books'}>Corpus</Link></li>
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
