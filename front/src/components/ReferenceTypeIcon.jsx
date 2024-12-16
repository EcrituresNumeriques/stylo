import React from 'react'

import { iconName } from '../helpers/bibtex'
import styles from './ReferenceTypeIcon.module.scss'

export default function ReferenceTypeIcon({ type, className }) {
  return (
    <img
      src={`/images/bibtex/${iconName(type)}.svg`}
      className={[styles.icon, className].join(' ')}
      alt={type}
      title={type}
    />
  )
}
