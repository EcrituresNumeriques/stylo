import React from 'react'

import { iconName } from '../../helpers/bibtex'
import styles from './CitationTypeIcon.module.scss'

export default function CitationTypeIcon({ type, className }) {
  return <img
    src={`/images/bibtex/${iconName(type)}.svg`}
    className={[styles.icon, className].join(' ')}
    alt={type}
    title={type}
  />
}
