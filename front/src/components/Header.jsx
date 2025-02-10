import React, { useMemo } from 'react'
import { LifeBuoy } from 'react-feather'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'

import logoContent from '/images/logo.svg?inline'
import { useActiveWorkspace } from '../hooks/workspace.js'

import styles from './header.module.scss'
import LanguagesMenu from './header/LanguagesMenu.jsx'
import UserMenu from './header/UserMenu.jsx'
import { useActiveUserId } from '../hooks/user.js'

export default function Header() {
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = useMemo(
    () => activeWorkspace?._id,
    [activeWorkspace]
  )
  const userId = useActiveUserId()
  const { t } = useTranslation()

  return (
    <header className={styles.headerContainer} role="banner">
      <section className={styles.header}>
        <h1 className={styles.logo}>
          <NavLink to="/" rel="home">
            <img src={logoContent} alt="Stylo" title="Stylo" />
          </NavLink>
        </h1>
        <nav role="navigation">
          <ul className={styles.menuLinks}>
            {userId && (
              <li>
                <NavLink
                  to={
                    activeWorkspaceId
                      ? `/workspaces/${activeWorkspaceId}/articles`
                      : '/articles'
                  }
                >
                  {t('header.articles.link')}
                </NavLink>
              </li>
            )}
            {userId && (
              <li>
                <NavLink
                  to={
                    activeWorkspaceId
                      ? `/workspaces/${activeWorkspaceId}/corpus`
                      : '/corpus'
                  }
                >
                  {t('header.corpus.link')}
                </NavLink>
              </li>
            )}
            {!userId && (
              <li>
                <NavLink to="/">{t('credentials.login.confirmButton')}</NavLink>
              </li>
            )}
            {!userId && (
              <li>
                <NavLink to="/register" className={styles.registerAction}>
                  {t('credentials.login.registerLink')}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
        <nav className={styles.secondaryNav}>
          {userId && <UserMenu />}
          <a
            className={styles.documentationLink}
            href="https://stylo-doc.ecrituresnumeriques.ca"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LifeBuoy size={16} />
            {t('header.documentation.link')}
          </a>
          <LanguagesMenu />
        </nav>
      </section>
    </header>
  )
}
