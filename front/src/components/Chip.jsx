import React from 'react'

import styles from './Chip.module.scss'

/**
 * @typedef {Object} ChipProps
 * @property {string} color
 * @property {string=} label
 */

/**
 *
 * @param {ChipProps} props
 * @returns {React.ReactElement}
 */
export default function Chip({ color = 'grey', label = '' }) {
  return (
    <span
      role={label ? '' : 'presentation'}
      aria-label={label}
      className={styles.chip}
      style={{ backgroundColor: color }}
    />
  )
}
