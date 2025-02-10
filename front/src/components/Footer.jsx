import React, { useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, Route, Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import styles from './header.module.scss'
import { HelpCircle } from 'react-feather'

export default function Footer() {
  const dispatch = useDispatch()
  const location = useLocation()
  const userHasConsent = useSelector(
    (state) => state.userPreferences.trackingConsent
  )
  const toggleConsent = useCallback(
    () => dispatch({ type: 'USER_PREFERENCES_TOGGLE', key: 'trackingConsent' }),
    []
  )
  const { t } = useTranslation()

  return (
    <footer className={styles.footerContainer}>
      <ul className={styles.footerList}>
        <li>Stylo {APP_VERSION}</li>
        <li>
          <a
            href="https://stylo-doc.ecrituresnumeriques.ca"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HelpCircle className={styles.linkIcon} size={14} />
            {t('footer.documentation.link')}
          </a>
        </li>
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
          <Link to="/privacy">{t('footer.privacy.link')}</Link>
        </li>
        {import.meta.env.SNOWPACK_MATOMO_URL && (
          <li>
            <label className={styles.consentLabel}>
              <input
                type="checkbox"
                checked={userHasConsent}
                onChange={toggleConsent}
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
