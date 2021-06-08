import React, { useState, useEffect } from 'react'
import {Clipboard} from 'react-feather'
import CopyToClipboard from 'react-copy-to-clipboard'

import styles from './Citation.module.scss'
import CitationTypeIcon from './CitationTypeIcon'
import Button from '../Button'

export default function Citation ({ entry }) {
  const { key, title, type } = entry

  return (
    <p
      className={styles.reference}
      title={title}
    >
      <CitationTypeIcon type={type} className={styles.citationTypeIcon} />
      <span className={styles.citationName}>@{key}</span>

      <CopyToClipboard text={`[@${key}]`}>
        <Button title="Copy to clipboard" className={styles.copyToClipboard} icon={true}><Clipboard /></Button>
      </CopyToClipboard>
    </p>
  )
}
