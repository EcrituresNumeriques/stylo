import React from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'

import { usePreferenceItem } from '../hooks/user.js'

import styles from './header.module.scss'

export default function Footer() {
  const { t } = useTranslation()

  const { value: userHasConsent, toggleValue } = usePreferenceItem(
    'trackingConsent',
    'user'
  )

  return (
    <footer className={styles.footerContainer}>
      <ul className={styles.footerList}>
        <li>Stylo {APP_VERSION}</li>
        <li>
          <a
            href="https://github.com/EcrituresNumeriques/stylo/releases"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('footer.changelog.link')}
          </a>
        </li>
        <li>
          <NavLink to="/privacy">{t('footer.privacy.link')}</NavLink>
        </li>
        {import.meta.env.SNOWPACK_MATOMO_URL && (
          <li>
            <label className={styles.consentLabel}>
              <input
                type="checkbox"
                checked={userHasConsent}
                onChange={toggleValue}
                disabled={true}
              />
              {t('footer.navStats.checkbox')}
            </label>
          </li>
        )}
      </ul>
    </footer>
  )
}
