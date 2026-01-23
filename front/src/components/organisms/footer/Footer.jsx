import React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import styles from './Footer.module.scss'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className={styles.container}>
      <ul className={styles.links}>
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
          <a
            href="https://discussions.revue30.org/c/stylo/entraide-stylo/7"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('footer.community.link')}
          </a>
        </li>
      </ul>
    </footer>
  )
}
