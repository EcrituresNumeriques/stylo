import { LogOut, User } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useRouteLoaderData } from 'react-router'

import styles from '../header.module.scss'

export default function UserMenu() {
  const { t } = useTranslation()
  const { user } = useRouteLoaderData('app')
  const userId = user?._id

  if (!userId) {
    return (
      <nav className={styles.userMenu} aria-label={t('header.userMenu.title')}>
        <NavLink data-testid="login" to="/login">{t('credentials.login.confirmButton')}</NavLink>

        <NavLink to="/register" className="hidden-below-tablet">
          {t('credentials.login.registerLink')}
        </NavLink>
      </nav>
    )
  }

  return (
    <nav className={styles.userMenu} aria-label={t('header.userMenu.title')}>
      <NavLink
        to="/credentials"
        aria-label={t('header.userMenu.profile')}
        aria-description={t('header.userMenu.profile.description')}
      >
        <User aria-hidden className="icon hidden-below-tablet" />

        <span className="hidden-below-tablet">{user.displayName}</span>
        <span className="hidden-above-tablet">
          {t('header.userMenu.shortLabel')}
        </span>
      </NavLink>

      <Link to="/logout">
        <LogOut className="icon" aria-hidden />
        <span className="sr-only">{t('credentials.logout.confirmButton')}</span>
      </Link>
    </nav>
  )
}
