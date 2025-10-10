import clsx from 'clsx'
import { Menu } from 'lucide-react'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation, useRouteLoaderData } from 'react-router'

import logoContent from '/images/logo.svg?inline'

import useComponentVisible from '../hooks/componentVisible.js'
import { useActiveWorkspaceId } from '../hooks/workspace.js'

import LanguagesMenu from './header/LanguagesMenu.jsx'
import UserMenu from './header/UserMenu.jsx'
import WorkspacesMenu from './workspace/WorkspacesMenu.jsx'

import styles from './header.module.scss'
import { useDispatch } from 'react-redux'

export default function Header() {
  const { t } = useTranslation()
  const activeWorkspaceId = useActiveWorkspaceId()
  const dispatch = useDispatch()
  const { user } = useRouteLoaderData('app')
  const location = useLocation()
  const activeTool = location.pathname.includes('/corpus')
    ? 'corpus'
    : 'articles'
  const userId = user?._id
  const baseUrl = useMemo(
    () => (activeWorkspaceId ? `/workspaces/${activeWorkspaceId}` : ''),
    [activeWorkspaceId]
  )
  const {
    ref: workspacesRef,
    isComponentVisible: areWorkspacesVisible,
    toggleComponentIsVisible: toggleWorkspaces,
  } = useComponentVisible(false, 'workspaces')
  const {
    ref: toolsRef,
    isComponentVisible: areToolsVisible,
    toggleComponentIsVisible: toggleTools,
  } = useComponentVisible(false, 'tools')

  const resetWorkspaceId = useCallback(() => {
    dispatch({ type: 'SET_USER_PREFERENCES', key: 'workspaceId', value: null })
  }, [])

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        <NavLink to="/" rel="home"  className={styles.logo}>
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
                <li
                  hidden={!userId}
                  ref={workspacesRef}
                  className={styles.toggleMenu}
                >
                  <button
                    aria-controls="header-workspaces-list"
                    aria-expanded={areWorkspacesVisible}
                    onClick={toggleWorkspaces}
                  >
                    {t('header.mainMenu.workspaces')}
                  </button>

                  <div
                    className={styles.toggleMenuContainer}
                    id="header-workspaces-list"
                    hidden={!areWorkspacesVisible}
                  >
                    <ul
                      className={styles.toggleMenuList}
                      aria-label={t('header.mainMenu.workspaces.list')}
                    >
                      <li>
                        <Link
                          to={`/${activeTool}`}
                          onClick={resetWorkspaceId}
                          aria-current={!activeWorkspaceId ? 'page' : false}
                        >
                          <span
                            className={styles.chip}
                            style={{ backgroundColor: '#ccc' }}
                          />
                          {t('workspace.myspace')}
                        </Link>
                      </li>

                      <WorkspacesMenu activeTool={activeTool} />

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
          </nav>
        )}

        <UserMenu />
        <LanguagesMenu />
      </div>
    </header>
  )
}
