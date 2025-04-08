import React, { useMemo } from 'react'
import { Bot, User } from 'lucide-react'
import { clsx } from 'clsx'

import i18n from '../../i18n.js'

import styles from './Version.module.scss'

export default function Version({
  title,
  description,
  creator,
  type,
  date,
  selected,
  onClick = () => {},
}) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const shortDate = useMemo(() => {
    if (date) {
      const options = {
        month: 'short',
        day: 'numeric',
      }
      if (currentYear !== date.getFullYear()) {
        options.year = '2-digit'
      }
      return new Intl.DateTimeFormat(i18n.language, options).format(date)
    }
    return ''
  }, [date, currentYear])

  const automatedVersion =
    type === 'editingSessionEnded' || type === 'collaborativeSessionEnded'

  const workingCopy = type === 'workingCopy'

  return (
    <div className={styles.container}>
      <div className={styles.columns}>
        <div className={styles.date}>{shortDate}</div>
        <div className={styles.separator}>
          <div
            className={clsx(
              styles.indicator,
              automatedVersion && styles.automated,
              workingCopy && styles.workingCopy
            )}
          >
            {automatedVersion && <Bot size="0.9rem" />}
          </div>
        </div>
        <div
          className={clsx(styles.info, selected && styles.selected)}
          onClick={onClick}
        >
          <div className={styles.title}>{title}</div>
          <div className={styles.description}>{description}</div>
          <div className={styles.attributes}>
            <div className={styles.attribute}>
              {creator && (
                <>
                  <User size={'1rem'} /> {creator}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
