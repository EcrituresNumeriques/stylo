import React, { useMemo } from 'react'
import { LifeBuoy } from 'react-feather'
import { useSelector } from 'react-redux'
import { NavLink, Route, Switch } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import logoContent from '/images/logo.svg?inline'
import { useActiveWorkspace } from '../hooks/workspace.js'

import styles from './header.module.scss'
import LanguagesMenu from './header/LanguagesMenu.jsx'
import UserMenu from './header/UserMenu.jsx'

function Header() {
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = useMemo(
    () => activeWorkspace?._id,
    [activeWorkspace]
  )
  const connected = useSelector((state) => state.loggedIn)
  const { t } = useTranslation()

  return (
    <Switch>
      <Route path="*/preview" />
      <Route path="*">
        <header className={styles.headerContainer}>
          <section className={styles.header}>
            <h1 className={styles.logo}>
              <NavLink
                to={
                  activeWorkspaceId
                    ? `/workspaces/${activeWorkspaceId}/articles`
                    : '/'
                }
              >
                <img src={logoContent} alt="Stylo" />
              </NavLink>
            </h1>
            {connected && (
              <>
                <nav>
                  <ul className={styles.menuLinks}>
                    <li>
                      <NavLink
                        to={
                          activeWorkspaceId
                            ? `/workspaces/${activeWorkspaceId}/articles`
                            : '/articles'
                        }
                      >
                        {t('workspace.articlesCount.label')}
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to={
                          activeWorkspaceId
                            ? `/workspaces/${activeWorkspaceId}/corpus`
                            : '/corpus'
                        }
                      >
                        {t('article.corpus.title')}
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
                    <LifeBuoy size={16} role="presentation" />
                    {t('footer.documentation.link')}
                  </a>
                  <LanguagesMenu />
                </nav>
              </>
            )}
            {!connected && (
              <>
                <nav>
                  <ul className={styles.menuLinks}>
                    <li>
                      <NavLink to="/">{t('header.login')}</NavLink>
                    </li>
                    <li>
                      <NavLink to="/register" className={styles.registerAction}>
                        {t('header.register')}
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

export default Header
