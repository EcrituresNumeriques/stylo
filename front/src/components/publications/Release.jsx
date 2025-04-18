import React from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarDays } from 'lucide-react'
import clsx from 'clsx'

import styles from '../../layout.module.scss'
import homeStyles from '../Home.module.scss'
import buttonStyles from '../button.module.scss'

export default function Release({ entry }) {
  const { t, i18n } = useTranslation()
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // In case no data has been fetched
  if (!entry) {
    return null
  }

  const title = entry.querySelector('title').textContent
  const link = entry
    .querySelector('link[type="text/html"]')
    .getAttribute('href')
  const date = dateFormat.format(
    new Date(entry.querySelector('updated').textContent)
  )

  const __html = entry.querySelector('content[type="html"]').textContent

  return (
    <article className={styles.article} lang="fr">
      <h3>{title}</h3>

      <ul className={styles.articleMetadata}>
        <li>
          <CalendarDays
            className="icon"
            aria-label={t('publication.publishedAt')}
          />
          {date}
        </li>
      </ul>

      <details className={homeStyles.changelog}>
        <summary className={buttonStyles.secondary}>
          {t('publication.release.details')}
        </summary>

        <div
          className="generated-content"
          dangerouslySetInnerHTML={{ __html }}
        />
      </details>

      <p>
        <a
          href={link}
          target="_blank"
          rel="noreferrer noopener"
          className={clsx(buttonStyles.linkSecondary, homeStyles.moreLink)}
          aria-label={t('more.about.accessibleLabel', {
            about: title,
          })}
        >
          {t('more.about')}
        </a>
      </p>
    </article>
  )
}
