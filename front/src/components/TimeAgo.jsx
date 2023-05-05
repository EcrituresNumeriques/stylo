import clsx from 'clsx'
import React from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

import i18n from '../i18n.js'
import styles from './TimeAgo.module.css'

const DIVISIONS = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' }
]

export default function TimeAgo ({ date, className }) {
  const { t } = useTranslation()
  const formatter = new Intl.RelativeTimeFormat(i18n.language, {
    numeric: 'auto'
  })
  let duration = (new Date(date) - new Date()) / 1000
  let value
  if (Math.abs(duration) < 60) {
    value = t('time.fewSecondsAgo')
  } else {
    let division = DIVISIONS[0]
    for (let i = 0; i <= DIVISIONS.length; i++) {
      division = DIVISIONS[i]
      if (Math.abs(duration) < division.amount) {
        break
      }
      duration /= division.amount
    }
    value = formatter.format(Math.round(duration), division.name)
  }
  return (
    <time className={clsx(className, styles.time)} dateTime={date}>{value}</time>
  )
}

TimeAgo.propTypes = {
  date: PropTypes.string,
  className: PropTypes.string,
}
