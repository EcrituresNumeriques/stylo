import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

import { STATS_SPRITE_URL, useStatsCharts } from '../../hooks/stats.js'

import styles from './Stats.module.scss'

export default function Stats() {
  const { t } = useTranslation()
  const { data: charts = [], error } = useStatsCharts()

  return (
    <section className={styles.stats}>
      <Helmet>
        <title>{t('stats.title')}</title>
      </Helmet>

      <h1>{t('stats.title')}</h1>

      {error && <p role="alert">{t('stats.error')}</p>}

      {charts.map(({ id, viewBox, title, description }) => (
        <figure key={id} className={styles.chart}>
          <figcaption aria-hidden="true">{title}</figcaption>
          <svg
            viewBox={viewBox}
            role="img"
            aria-describedby={`stats-${id}-description`}
          >
            <title>{title}</title>
            <desc id={`stats-${id}-description`}>{description}</desc>
            <use href={`${STATS_SPRITE_URL}#${id}`} />
          </svg>
        </figure>
      ))}
    </section>
  )
}
