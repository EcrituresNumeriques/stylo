import clsx from 'clsx'
import { CalendarDays } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import styles from '../../../layout.module.scss'
import buttonStyles from '../../atoms/Button.module.scss'
import homeStyles from '../../pages/Home.module.scss'

export default function Workshop({ entry }) {
  const { t, i18n } = useTranslation()
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const itemId = useId()
  const title = entry.querySelector('title').textContent
  const link = entry.querySelector('link').getAttribute('href')
  const date = dateFormat.format(
    new Date(entry.querySelector('updated').textContent)
  )

  return (
    <article className={styles.article} aria-labelledby={itemId}>
      <h3 id={itemId}>{title}</h3>

      <ul className={styles.articleMetadata}>
        {/*<li>
          <MapPin className="icon" aria-label="Lieu :" /> Lyon
        </li>*/}
        <li>
          <CalendarDays className="icon" aria-label={t('publication.date')} />
          {date}
        </li>
        {/*<li>
          <Building2 className="icon" aria-label="Organisateur :" /> Urfist
        </li>*/}
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
