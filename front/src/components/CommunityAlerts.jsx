import clsx from 'clsx'
import { AlertOctagon } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { applicationConfig } from '../config.js'

import styles from './molecules/Alert.module.scss'

export default function CommunityAlerts({ topics = [] }) {
  if (!topics || !topics.length) {
    return null
  }

  const { t } = useTranslation()

  return (
    <section aria-label={t('main.alerts.listTitle')} role="list">
      {topics.map((topic) => (
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
        </div>
      ))}
    </section>
  )
}
