import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './header.module.scss'

export default function SkipLinks() {
  const { t } = useTranslation()

  return (
    <nav
      id="skiplinks"
      aria-labelledby="skiplinks-headline"
      className={styles.skiplinks}
    >
      <strong id="skiplinks-headline">{t('header.skiplinks.title')}</strong>

      <ul aria-labelledby="skiplinks-headline" className={styles.menuLinks}>
        <li>
          <a href="#main-navigation">{t('header.mainMenu.button')}</a>
        </li>
        <li>
          <a href="#languages-selection">{t('header.languagesMenu.list')}</a>
        </li>
        <li>
          <a href="#content">{t('main.title')}</a>
        </li>
      </ul>
    </nav>
  )
}
