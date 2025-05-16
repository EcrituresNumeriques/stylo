import React from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'

import styles from './header.module.scss'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className={styles.footerContainer}>
      <ul className={styles.footerList}>
        <li>
          <a
            href="https://github.com/EcrituresNumeriques/stylo/releases"
            rel="noopener noreferrer"
            target="_blank"
            aria-label={t('footer.changelog.link', { version: APP_VERSION })}
          >
            Stylo {APP_VERSION}
          </a>
        </li>
        <li>
          <NavLink to="/privacy">{t('footer.privacy.link')}</NavLink>
        </li>
        <li>
          <a
            href="https://stylo-doc.ecrituresnumeriques.ca"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('footer.documentation.link')}
          </a>
        </li>
        <li>
          <a href="https://discussions.revue30.org/c/stylo/" target="_blank" rel="noopener noreferrer">
            {t('footer.community.link')}
          </a>
        </li>
      </ul>
    </footer>
  )
}
