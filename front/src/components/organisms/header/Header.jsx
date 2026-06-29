import clsx from 'clsx'
import { MenuIcon } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useRouteLoaderData } from 'react-router'

import logoContent from '/images/logo.svg?inline'

import useComponentVisible from '../../../hooks/componentVisible.js'
import { useActiveWorkspaceId } from '../../../hooks/workspace.js'

import HelpMenu from './HelpMenu.jsx'
import styles from './header.module.scss'
import LanguagesMenu from './LanguagesMenu.jsx'
import UserMenu, {
  LoginItem,
  LogoutItem,
  RegisterItem,
  UserProfileItem,
} from './UserMenu.jsx'
import WorkspacesMenu from './WorkspacesMenu.jsx'

/**
 * We use several accessible design patterns:
 * - https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/banner.html
 * - https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html
 * @returns
 */
export default function Header() {
  const { t } = useTranslation()
  const portalRef = useRef(null)
  const headerRef = useRef(null)
  const activeWorkspaceId = useActiveWorkspaceId()
  const { user } = useRouteLoaderData('app')
  const userId = user?._id
  const baseUrl = useMemo(
    () => (activeWorkspaceId ? `/workspaces/${activeWorkspaceId}` : ''),
    [activeWorkspaceId]
  )

  const {
    ref: mainMenuRef,
    id: menuId,
    isComponentVisible: isMainMenuVisible,
    toggleComponentIsVisible: toggleMainMenu,
  } = useComponentVisible({ namespace: 'header', ref: headerRef })

  useEffect(() => {
    document.body.classList[isMainMenuVisible ? 'add' : 'remove']('modal-open')
  }, [isMainMenuVisible])

  /*
   * Structure is:
   * - header
   *  - brand container (desktop)
   *    - main navigation (workspace, articles, corpus)
   *    - secondary navigation (user, help, languages)
   *    - mobile menu button
   *  - mobile menu
   *    - secondary navigation (user, help, languages)
   *    - workspace selector
   *    - main navigation (articles, corpus)
   *  - mobile submenu (portal destination when a mobile menu item is active)
   */

  return (
    <header
      className={clsx(styles.header, isMainMenuVisible && styles.isModal)}
      ref={headerRef}
    >
      <div className={clsx(styles.container, styles.brand)}>
        <NavLink to="/" rel="home" className={styles.logo}>
          <img src={logoContent} alt="Stylo" aria-label={t('header.home')} />
        </NavLink>

        <nav
          id="main-navigation"
          aria-label={t('header.mainMenu.label')}
          className={clsx(
            styles.mainMenu,
            styles.list,
            styles.isDesktop,
            'hidden-below-tablet'
          )}
        >
          <ul
            className={clsx(styles.mainMenuList)}
            aria-label={t('header.mainMenu.listLabel')}
          >
            <li hidden={!userId}>
              <WorkspacesMenu />
            </li>
            <li className={styles.topNav} hidden={!userId}>
              <NavLink to={`${baseUrl}/articles`} prefetch="intent">
                {t('header.mainMenu.articles')}
              </NavLink>
            </li>
            <li className={styles.topNav} hidden={!userId}>
              <NavLink to={`${baseUrl}/corpus`}>
                {t('header.mainMenu.corpus')}
              </NavLink>
            </li>
          </ul>
        </nav>

        <nav
          id="secondary-navigation"
          aria-label={t('header.secondaryMenu.label')}
          className={clsx(styles.isDesktop, 'hidden-below-tablet')}
        >
          <div className={clsx(styles.listInline)}>
            <UserMenu />
            <HelpMenu mode="compact" />
            <LanguagesMenu mode="compact" />
          </div>
        </nav>

        <button
          className={clsx(styles.toggleMenuButton, 'hidden-above-tablet')}
          aria-controls={menuId}
          aria-expanded={isMainMenuVisible}
          onClick={toggleMainMenu}
          type="button"
        >
          <MenuIcon aria-hidden className="icon" />
          {t('header.mainMenu.mobileButton')}
        </button>
      </div>

      <nav
        id={menuId}
        className={clsx(styles.secondaryMenu, styles.isMobile)}
        hidden={!isMainMenuVisible}
        aria-label={t('header.mainMenu.label')}
      >
        <ul className={styles.list} aria-label={t('header.userMenu.listLabel')}>
          <li>
            {userId && <UserProfileItem />}
            {!userId && <LoginItem />}
          </li>
          <li>
            {userId && <LogoutItem />}
            {!userId && <RegisterItem />}
          </li>
          <li>
            <HelpMenu teleportRef={portalRef} />
          </li>
          <li>
            <LanguagesMenu teleportRef={portalRef} />
          </li>
        </ul>

        <WorkspacesMenu hidden={!userId} teleportRef={portalRef} />

        <ul
          className={clsx(styles.mainMenuList, styles.isMobile)}
          aria-label={t('header.mainMenu.listLabel')}
          ref={mainMenuRef}
        >
          <li hidden={!userId} className={styles.topNav}>
            <NavLink to={`${baseUrl}/articles`} prefetch="intent">
              {t('header.mainMenu.articles')}
            </NavLink>
          </li>
          <li hidden={!userId} className={styles.topNav}>
            <NavLink to={`${baseUrl}/corpus`}>
              {t('header.mainMenu.corpus')}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div
        className={clsx(styles.mobileSubmenu, styles.list)}
        ref={portalRef}
      />
    </header>
  )
}
