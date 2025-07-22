import React from 'react'
import { useTranslation } from 'react-i18next'

import { useArticleStatsStore } from '../stores/articleStore.js'

import styles from './articleStats.module.scss'

export default function ArticleStats() {
  const { t } = useTranslation()
  const { stats } = useArticleStatsStore()
  return (
    <ul className={styles.stats} aria-label={t('article.stats.menuLabel')}>
      <li>{t('article.stats.words', { count: stats.wordCount })}</li>
      <li>
        {t('article.stats.chars', {
          count: stats.charCountNoSpace,
          countWithSpaces: stats.charCountPlusSpace,
        })}
      </li>
      <li>{t('article.stats.citations', { count: stats.citationNb })}</li>
    </ul>
  )
}
