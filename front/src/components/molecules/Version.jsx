import { clsx } from 'clsx'
import { Bot, User } from 'lucide-react'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './Version.module.scss'

const relativeTimeFormatOptions = {
  localeMatcher: 'best fit',
  numeric: 'auto',
  style: 'long',
}

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.creator
 * @param {string} props.type
 * @param {string} props.date
 * @param {boolean} props.selected
 * @param {() => {}} props.onClick
 * @returns {React.ReactElement}
 */
export default function Version({
  title,
  description,
  creator,
  type,
  date,
  selected,
  onClick = () => {},
}) {
  const { i18n } = useTranslation()
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
    } else if (type === 'workingCopy') {
      // today!
      return new Intl.RelativeTimeFormat(
        i18n.language,
        relativeTimeFormatOptions
      ).format(0, 'day')
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
                  <User size={'1rem'} aria-hidden /> {creator}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
