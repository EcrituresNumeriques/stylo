import React from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'

import styles from '../components/Write/write.module.scss'

export default function Privacy() {
  const { t } = useTranslation()
  return (
    <section className={styles.container}>
      <Helmet>
        <title>{t('footer.privacy.link')}</title>
      </Helmet>
      <article className={styles.simplePage}>
        <h2>Privacy Terms</h2>

        <p>Coming soon…</p>
      </article>
    </section>
  )
}
