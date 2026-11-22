import clsx from 'clsx'
import { CalendarDaysIcon, CircleUserIcon } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import styles from '../../../layout.module.scss'
import buttonStyles from '../../atoms/Button.module.scss'
import homeStyles from '../../pages/Home.module.scss'

export default function Publication({ entry }) {
  const { t, i18n } = useTranslation()
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const itemId = useId()
  const title = entry.querySelector('title').textContent
  // an entry may have several authors, or none at all
  const authors = Array.from(entry.querySelectorAll('author > name'))
    .map((name) => name.textContent.trim())
    .filter(Boolean)
    .join(', ')
  const link = entry.querySelector('link').getAttribute('href')
  const date = dateFormat.format(
    new Date(entry.querySelector('updated').textContent)
  )

  return (
    <article className={styles.article} aria-labelledby={itemId}>
      <h3 id={itemId} dangerouslySetInnerHTML={{ __html: title }}></h3>

      <ul className={styles.articleMetadata}>
        {authors && (
          <li>
            <CircleUserIcon
              role="img"
              className="icon"
              aria-label={t('publication.author')}
            />
            {authors}
          </li>
        )}
        <li>
          <CalendarDaysIcon
            role="img"
            className="icon"
            aria-label={t('publication.publishedAt')}
          />
          {date}
        </li>
      </ul>

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
    </article>
  )
}
