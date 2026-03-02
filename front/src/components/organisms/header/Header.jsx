import clsx from 'clsx'
import { Menu } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useRouteLoaderData } from 'react-router'

import logoContent from '/images/logo.svg?inline'

import useComponentVisible from '../../../hooks/componentVisible.js'
import { useActiveWorkspaceId } from '../../../hooks/workspace.js'

import HelpMenu from './HelpMenu.jsx'
import LanguagesMenu from './LanguagesMenu.jsx'
import UserMenu from './UserMenu.jsx'
import WorkspacesMenu from './WorkspacesMenu.jsx'

import styles from './header.module.scss'

export default function Header() {
  const { t } = useTranslation()
  const activeWorkspaceId = useActiveWorkspaceId()
  const { user } = useRouteLoaderData('app')
  const userId = user?._id
  const baseUrl = useMemo(
    () => (activeWorkspaceId ? `/workspaces/${activeWorkspaceId}` : ''),
    [activeWorkspaceId]
  )
  const {
    ref: toolsRef,
    isComponentVisible: areToolsVisible,
    toggleComponentIsVisible: toggleTools,
  } = useComponentVisible(false, 'tools')

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        <NavLink to="/" rel="home" className={styles.logo}>
          <img src={logoContent} alt="Stylo" aria-hidden />
          <span className="sr-only">{t('header.home')}</span>
        </NavLink>

        {userId && (
          <nav
            role="navigation"
            id="main-navigation"
            ref={toolsRef}
            className={styles.navigation}
            aria-label={t('header.mainMenu.list')}
            aria-description={t('header.mainMenu.description')}
          >
            <button
              className={styles.menuButton}
              aria-controls="app-menu"
              aria-pressed={areToolsVisible}
              onClick={toggleTools}
            >
              <Menu className="icon" aria-hidden />
              {t('header.mainMenu.button')}
            </button>

            <div
              className={clsx(areToolsVisible && styles.menuLinksMobileVisible)}
              id="app-menu"
            >
              <ul
                className={styles.menuLinks}
                aria-label={t('header.mainMenu.list')}
              >
                <li hidden={!userId}>
                  <NavLink to={`${baseUrl}/articles`} prefetch="intent">
                    {t('header.mainMenu.articles')}
                  </NavLink>
                </li>
                <li hidden={!userId}>
                  <NavLink to={`${baseUrl}/corpus`}>
                    {t('header.mainMenu.corpus')}
                  </NavLink>
                </li>
                <li hidden={!userId} className={styles.toggleMenu}>
                  <WorkspacesMenu />
                </li>
              </ul>
            </div>
          </nav>
        )}

        <UserMenu />
        <HelpMenu />
        <LanguagesMenu />
      </div>
    </header>
  )
}
