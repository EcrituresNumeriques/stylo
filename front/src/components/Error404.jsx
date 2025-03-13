import React from 'react'
import { useLocation } from 'react-router'

import styles from '../components/Write/write.module.scss'
import { useTranslation } from 'react-i18next'

export default function PageNotFound() {
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <section className={styles.container}>
      <article className={styles.error}>
        <h2>{t('error.404.title')}</h2>

        <p>
          {t('error.404.message')} <code>{location.pathname}</code>.
        </p>
      </article>
    </section>
  )
}
