import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import styles from './AppError.module.scss'

export default function PageNotFound() {
  const location = useLocation()
  const { t } = useTranslation('errors')

  return (
    <section className={styles.container}>
      <article className={styles.error}>
        <h2>{t('404.title')}</h2>

        <p>
          {t('404.message')} <code>{location.pathname}</code>.
        </p>
      </article>
    </section>
  )
}
