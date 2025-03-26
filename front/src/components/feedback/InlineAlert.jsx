import React from 'react'
import { AlertCircle } from 'lucide-react'

import styles from './InlineAlert.module.scss'

export default function InlineAlert({ title = 'Error', message }) {
  return (
    <p className={styles.inlineAlert} role="alert">
      <AlertCircle aria-hidden />

      <span className={styles.message}>
        <strong>{title}.</strong> {message}
      </span>
    </p>
  )
}
