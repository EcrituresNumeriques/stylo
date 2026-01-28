import React from 'react'
import { useTranslation } from 'react-i18next'
import { shallowEqual, useSelector } from 'react-redux'

import styles from './ArticleStats.module.scss'

export default function ArticleStats() {
  const { t } = useTranslation()
  const articleStats = useSelector((state) => state.articleStats, shallowEqual)
  return (
    <ul className={styles.stats} aria-label={t('article.stats.menuLabel')}>
      <li>{t('article.stats.words', { count: articleStats.wordCount })}</li>
      <li>
        {t('article.stats.chars', {
          count: articleStats.charCountNoSpace,
          countWithSpaces: articleStats.charCountPlusSpace,
        })}
      </li>
      <li>
        {t('article.stats.citations', { count: articleStats.citationNb })}
      </li>
    </ul>
  )
}
