import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import { usePreferenceItem } from '../hooks/user.js'

import styles from './Page.module.scss'

export default function Privacy() {
  const { t } = useTranslation()

  const { value: userHasConsent, toggleValue } = usePreferenceItem(
    'trackingConsent',
    'user'
  )

  return (
    <section className={styles.container}>
      <Helmet>
        <title>{t('footer.privacy.link')}</title>
      </Helmet>

      <article className={styles.simplePage}>
        <h2>{t('footer.privacy.link')}</h2>

        <p>Coming soon…</p>

        {import.meta.env.SNOWPACK_MATOMO_URL && (
          <p>
            <input
              type="checkbox"
              checked={userHasConsent}
              onChange={toggleValue}
              id="tracking-consent-checkbox"
              />

            <label className={styles.consentLabel} htmlFor="tracking-consent-checkbox">
              {t('footer.navStats.checkbox')}
            </label>
          </p>
        )}
      </article>
    </section>
  )
}
