import { User, PencilRuler } from 'lucide-react'
import React from 'react'
import i18n from '../../i18n.js'

import styles from './Version.module.scss'

export default function Version({ title, description, creator, date }) {
  return (
    <div className={styles.container}>
      <div className={styles.columns}>
        <div className={styles.date}>
          {' '}
          {new Intl.DateTimeFormat(i18n.language, {
            month: 'short',
            day: 'numeric',
          }).format(date)}
        </div>
        <div className={styles.separator}>
          <div className={styles.indicator}></div>
        </div>
        <div className={styles.info}>
          <div className={styles.title}>{title}</div>
          <div className={styles.description}>{description}</div>
          <div className={styles.attributes}>
            <div className={styles.attribute}>
              <User size={'1rem'} /> {creator}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
