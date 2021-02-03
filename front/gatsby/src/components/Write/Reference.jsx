import React, { useState, useEffect } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import {Clipboard} from 'react-feather'
import styles from './reference.module.scss'
import ReferenceTypeIcon from '../ReferenceTypeIcon'
import Button from '../Button'

export default function BibliographyReference ({ entry }) {
  const { key, title, type } = entry

  return (
    <p
      className={styles.reference}
      title={title}
    >
      <ReferenceTypeIcon type={type} className={styles.referenceTypeIcon} />
      <span className={styles.referenceName}>@{key}</span>

      <CopyToClipboard text={`[@${key}]`}>
        <Button title="Copy to clipboard" className={styles.copyToClipboard} icon={true}><Clipboard /></Button>
      </CopyToClipboard>
    </p>
  )
}
