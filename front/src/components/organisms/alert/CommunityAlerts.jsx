import clsx from 'clsx'
import { AlertOctagon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { applicationConfig } from '../../../config.js'
import { useDismissedAlerts } from '../../../hooks/alerts.js'
import styles from '../../molecules/Alert.module.scss'
import DismissAlertButton from './DismissAlertButton.jsx'

export default function CommunityAlerts({ topics = [] }) {
  const { t } = useTranslation()
  const { isDismissed, dismiss } = useDismissedAlerts()
  const visibleTopics = (topics ?? []).filter(
    (topic) => !isDismissed(`community:${topic.id}`)
  )

  if (!visibleTopics.length) {
    return null
  }

  return (
    <section aria-label={t('main.alerts.listTitle')} role="list">
      {visibleTopics.map((topic) => (
        <div
          key={topic.id}
          role="listitem"
          aria-atomic="true"
          aria-live="assertive"
          className={clsx(styles.alert, styles.warning, styles.fullscreen)}
        >
          <AlertOctagon aria-hidden />

          <a
            href={`${applicationConfig.communityEndpoint}/t/${topic.id}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            {topic.fancy_title}
          </a>

          <DismissAlertButton
            onClick={() => dismiss(`community:${topic.id}`)}
          />
        </div>
      ))}
    </section>
  )
}
