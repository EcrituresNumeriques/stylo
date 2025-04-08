import React, { useMemo } from 'react'
import { LifeBuoy } from 'lucide-react'
import { useSelector } from 'react-redux'
import { NavLink, Route, Switch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import logoContent from '/images/logo.svg?inline'
import { useActiveWorkspace } from '../hooks/workspace.js'

import styles from './header.module.scss'
import LanguagesMenu from './header/LanguagesMenu.jsx'
import UserMenu from './header/UserMenu.jsx'

export default function Header() {
  const { t } = useTranslation()
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = useMemo(
    () => activeWorkspace?._id,
    [activeWorkspace]
  )

  const baseUrl = useMemo(
    () => (activeWorkspaceId ? `/workspaces/${activeWorkspaceId}` : ''),
    [activeWorkspaceId]
  )
  const connected = useSelector((state) => state.loggedIn)

  return (
    <Switch>
      <Route path="*/preview" />
      <Route path="/credentials/auth-callback" />
      <Route path="*">
        <header className={styles.headerContainer} role="banner">
          <section className={styles.header}>
            <h1 className={styles.logo}>
              <NavLink to="/" rel="home">
                <img src={logoContent} alt="Stylo" title="Stylo" />
              </NavLink>
            </h1>
            <nav role="navigation">
              <ul className={styles.menuLinks}>
                {connected && (
                  <li>
                    <NavLink to={`${baseUrl}/articles`}>
                      {t('header.articles.link')}
                    </NavLink>
                  </li>
                )}
                {connected && (
                  <li>
                    <NavLink to={`${baseUrl}/corpus`}>
                      {t('header.corpus.link')}
                    </NavLink>
                  </li>
                )}
                {!connected && (
                  <li>
                    <NavLink to="/login">
                      {t('credentials.login.confirmButton')}
                    </NavLink>
                  </li>
                )}
                {!connected && (
                  <li>
                    <NavLink to="/register" className={styles.registerAction}>
                      {t('credentials.login.registerLink')}
                    </NavLink>
                  </li>
                )}
              </ul>
            </nav>
            <nav className={styles.secondaryNav}>
              {connected && <UserMenu />}
              <a
                className={styles.documentationLink}
                href="https://stylo-doc.ecrituresnumeriques.ca"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LifeBuoy size={16} aria-hidden />
                {t('header.documentation.link')}
              </a>
              <LanguagesMenu />
            </nav>
          </section>
        </header>
      </Route>
    </Switch>
  )
}
