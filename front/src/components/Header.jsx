import React, { useMemo } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import clsx from 'clsx'

import logoContent from '/images/logo.svg?inline'
import { useActiveWorkspaceId } from '../hooks/workspace.js'
import useComponentVisible from '../hooks/componentVisible.js'
import { useActiveUser } from '../hooks/user.js'

import styles from './header.module.scss'
import LanguagesMenu from './header/LanguagesMenu.jsx'
import UserMenu from './header/UserMenu.jsx'

export default function Header() {
  const { t } = useTranslation()
  const activeWorkspaceId = useActiveWorkspaceId()
  const activeUser = useActiveUser()
  const location = useLocation()
  const activeTool = location.pathname.includes('/corpus') ? 'corpus' : 'articles'
  const userId = activeUser?._id

  const baseUrl = useMemo(
    () => (activeWorkspaceId ? `/workspaces/${activeWorkspaceId}` : ''),
    [activeWorkspaceId]
  )

  const { ref: workspacesRef, isComponentVisible: areWorkspacesVisible, toggleComponentIsVisible: toggleWorkspaces } = useComponentVisible(false, 'workspaces')
  const { ref: toolsRef, isComponentVisible: areToolsVisible, toggleComponentIsVisible: toggleTools } = useComponentVisible(false, 'tools')

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        <h1 className={styles.logo}>
          <NavLink to="/" rel="home">
            <img src={logoContent} alt="Stylo" aria-hidden />
            <span className="sr-only">{t('header.home')}</span>
          </NavLink>
        </h1>

        {userId && <nav role="navigation" id="main-navigation" ref={toolsRef} className={styles.navigation} aria-label={t('header.mainMenu.list')} aria-description={t('header.mainMenu.description')}>
          <button className={styles.menuButton} aria-controls="app-menu" aria-pressed={areToolsVisible} onClick={toggleTools}>
            <Menu className="icon" aria-hidden />
            {t('header.mainMenu.button')}
          </button>

          <div className={clsx(areToolsVisible && styles.menuLinksMobileVisible)} id="app-menu">
            <ul className={styles.menuLinks} aria-label={t('header.mainMenu.list')}>
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
              <li hidden={!userId} ref={workspacesRef} className={styles.toggleMenu}>
                <button aria-controls="header-workspaces-list" aria-expanded={areWorkspacesVisible} onClick={toggleWorkspaces}>
                  {t('header.mainMenu.workspaces')}
                </button>

                <div className={styles.toggleMenuContainer} id="header-workspaces-list" hidden={!areWorkspacesVisible}>
                  <ul className={styles.toggleMenuList} aria-label={t('header.mainMenu.workspaces.list')}>
                    <li>
                      <Link to={`/${activeTool}`} aria-current={!activeWorkspaceId ? 'page' : false}>
                        <span className={styles.chip} style={{ backgroundColor: '#ccc' }} />
                        {t('workspace.myspace')}
                      </Link>
                    </li>

                    {activeUser.workspaces.map((workspace) => (
                      <li key={workspace._id}>
                        <NavLink to={`/workspaces/${workspace._id}/${activeTool}`} state={{ from: location.pathname }}>
                          <span className={styles.chip} style={{ backgroundColor: workspace.color }} />

                          {workspace.name}
                        </NavLink>
                      </li>
                    ))}

                    <li>
                      <NavLink to={`/workspaces`} end>
                        {t('workspace.all')}
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </nav>}

        <UserMenu />
        <LanguagesMenu />
      </div>
    </header>
  )
}
