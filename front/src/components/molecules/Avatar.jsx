import React from 'react'

import styles from './Avatar.module.scss'

/**
 * @param {object} props
 * @param {string} props.text
 * @returns {Element}
 */
export default function Avatar({ text }) {
  const safeText = text.length <= 4 ? text : text.slice(0, 3)
  return (
    <div className={styles.avatar} title={text}>
      <span className={styles.text}>{safeText}</span>
    </div>
  )
}
