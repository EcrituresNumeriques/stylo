import React from 'react'
import { AlertCircle } from 'react-feather'
import styles from './InlineAlert.module.scss'

export default function InlineAlert({ title = 'Error', message }) {
  return (
    <div className={styles.inlineAlert}>
      <AlertCircle />
      <span className={styles.message}>
        <strong>{title}.</strong> {message}
      </span>
    </div>
  )
}
