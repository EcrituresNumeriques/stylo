import React from 'react'
import { LifeBuoy } from 'react-feather'
import { useSelector } from 'react-redux'
import { NavLink, Route, Switch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import logoContent from '/images/logo.svg?inline'
import { useActiveWorkspace } from '../hooks/workspace.js'

import styles from './header.module.scss'
import LanguagesMenu from './header/LanguagesMenu.jsx'
import UserMenu from './header/UserMenu.jsx'

export default function Header() {
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = activeWorkspace?._id

  const connected = useSelector((state) => state.loggedIn)
  const { t } = useTranslation()

  return (
    <Switch>
      <Route path="*/preview" />
      <Route path="*">
        <header className={styles.headerContainer} role="banner">
          <section className={styles.header}>
            <h1 className={styles.logo}>
              <NavLink to="/" rel="home">
                <img src={logoContent} alt="Stylo" />
              </NavLink>
            </h1>
            {connected && (
              <>
                <nav role="navigation">
                  <ul className={styles.menuLinks}>
                    <li>
                      <NavLink
                        to={
                          activeWorkspaceId
                            ? `/workspaces/${activeWorkspaceId}/articles`
                            : '/articles'
                        }
                      >
                        Articles
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to={
                          activeWorkspaceId
                            ? `/workspaces/${activeWorkspaceId}/books`
                            : '/books'
                        }
                      >
                        Corpus
                      </NavLink>
                    </li>
                  </ul>
                </nav>
                <nav className={styles.secondaryNav}>
                  <UserMenu />
                  <a
                    className={styles.documentationLink}
                    href="https://stylo-doc.ecrituresnumeriques.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LifeBuoy size={16} />
                    Documentation
                  </a>
                  <LanguagesMenu />
                </nav>
              </>
            )}
            {!connected && (
              <>
                <nav role="navigation">
                  <ul className={styles.menuLinks}>
                    <li>
                      <NavLink to="/">
                        {t('credentials.login.confirmButton')}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/register" className={styles.registerAction}>
                        {t('credentials.login.registerLink')}
                      </NavLink>
                    </li>
                  </ul>
                </nav>
                <nav className={styles.secondaryNav}>
                  <LanguagesMenu />
                </nav>
              </>
            )}
          </section>
        </header>
      </Route>
    </Switch>
  )
}
