import {
  LockKeyholeOpenIcon,
  UserIcon,
  UserLockIcon,
  UserPenIcon,
  UserPlusIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useRouteLoaderData } from 'react-router'

import useComponentVisible from '../../../hooks/componentVisible.js'

import styles from './header.module.scss'

export default function UserMenu() {
  const { t } = useTranslation()
  const {
    id: menuId,
    ref,
    isComponentVisible,
    toggleComponentIsVisible,
  } = useComponentVisible()
  const { user } = useRouteLoaderData('app')

  if (!user?._id) {
    return <AnonymousSubmenu />
  }

  const renderedSubmenu = <Submenu {...{ id: menuId, isComponentVisible }} />

  return (
    <div ref={ref} className={styles.dropdownMenu}>
      <button
        aria-expanded={isComponentVisible}
        aria-controls={menuId}
        onClick={toggleComponentIsVisible}
        className={styles.hasDropdown}
        title={t('header.userMenu.menuButtonLabel')}
        type="button"
      >
        <span>{t('header.userMenu.menuButton')}</span>
      </button>

      {renderedSubmenu}
    </div>
  )
}

function Submenu({ id, isComponentVisible }) {
  const { t } = useTranslation()
  const { user } = useRouteLoaderData('app')

  return (
    <ul
      className={styles.toggleMenuList}
      aria-label={t('header.userMenu.listLabel')}
      hidden={!isComponentVisible}
      id={id}
    >
      <li aria-label={t('header.userMenu.displayNameLabel', { user })}>
        <span className={styles.link}>
          <UserIcon aria-hidden className="icon" />

          {user.displayName}
        </span>
      </li>
      <li>
        <NavLink to="/credentials">{t('header.userMenu.profileLink')}</NavLink>
      </li>
      <li>
        <Link to="/credentials#backup">{t('header.userMenu.backupLink')}</Link>
      </li>
      <li>
        <Link to="/logout">{t('header.userMenu.logoutLink')}</Link>
      </li>
    </ul>
  )
}

function AnonymousSubmenu() {
  const { t } = useTranslation()

  return (
    <ul className={styles.listInline}>
      <li>
        <NavLink to="/login">{t('credentials.login.confirmButton')}</NavLink>
      </li>
      <li>
        <NavLink to="/register">{t('credentials.login.registerLink')}</NavLink>
      </li>
    </ul>
  )
}

export function UserProfileItem() {
  const { t } = useTranslation()
  const { user } = useRouteLoaderData('app')

  return (
    <NavLink
      to="/credentials"
      aria-label={t('header.userMenu.displayNameLabel', { user })}
    >
      <UserIcon aria-hidden className="icon" />

      <span>{user.displayName}</span>
    </NavLink>
  )
}

export function LoginItem() {
  const { t } = useTranslation()

  return (
    <NavLink data-testid="login" to="/login">
      <UserLockIcon aria-hidden className="icon" />
      {t('credentials.login.confirmButton')}
    </NavLink>
  )
}

export function LogoutItem() {
  const { t } = useTranslation()

  return (
    <Link to="/logout">
      <LockKeyholeOpenIcon aria-hidden className="icon" />
      {t('header.userMenu.logoutLink')}
    </Link>
  )
}

export function RegisterItem() {
  const { t } = useTranslation()

  return (
    <NavLink to="/register">
      <UserPlusIcon aria-hidden className="icon" />
      {t('credentials.login.registerLink')}
    </NavLink>
  )
}
