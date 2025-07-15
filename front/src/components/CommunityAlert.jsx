import React from 'react'
import { AlertOctagon } from 'lucide-react'

import styles from './molecules/Alert.module.scss'
import clsx from 'clsx'

export default function CommunityAlert ({ topic }) {

  if (!topic) {
    return null
  }

  return <div role="alert" className={clsx(styles.alert, styles.warning, styles.fullscreen)}>
    <AlertOctagon color={'rgb(250, 173, 20)'} aria-hidden />
    <a href={`https://discussions.revue30.org/t/${topic.id}`} target="_blank" rel="noreferrer noopener">
      {topic.fancy_title}
    </a>
  </div>
}