import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

import styles from './Page.module.scss'

export default function Privacy() {
  const { t } = useTranslation()
  return (
    <section className={styles.container}>
      <Helmet>
        <title>{t('user.bye.title')}</title>
      </Helmet>

      <article className={styles.simplePage}>
        <h2>{t('user.bye.title')}</h2>
        <p>{t('user.bye.description')}</p>
      </article>
    </section>
  )
}
