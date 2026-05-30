import { useTranslation } from 'react-i18next'

import styles from './ArticleStats.module.scss'

export default function ArticleStats({
  stats = {
    wordCount: 0,
    charCountNoSpace: 0,
    charCountPlusSpace: 0,
    citationNb: 0,
  },
}) {
  const { t } = useTranslation()
  const articleStats = stats
  return (
    <ul className={styles.stats} aria-label={t('article.stats.menuLabel')}>
      <li>
        {t('article.stats.chars', {
          count: articleStats.charCountNoSpace,
          countWithSpaces: articleStats.charCountPlusSpace,
        })}
      </li>
      <li>{t('article.stats.words', { count: articleStats.wordCount })}</li>
      <li>
        {t('article.stats.citations', { count: articleStats.citationNb })}
      </li>
    </ul>
  )
}
