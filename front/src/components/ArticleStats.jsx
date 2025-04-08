import React from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import styles from './articleStats.module.scss'
import { useTranslation } from 'react-i18next'

export default function ArticleStats() {
  const { t } = useTranslation()
  const articleStats = useSelector((state) => state.articleStats, shallowEqual)
  return (
    <ul className={styles.stats}>
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
