import React, { useState, useEffect } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import {Clipboard} from 'react-feather'
import styles from './reference.module.scss'
import ReferenceTypeIcon from '../ReferenceTypeIcon'
import Button from '../Button'

export default function BibliographyReference ({ entry }) {
  const { key, title, type } = entry
  const author = entry.entry.fields?.author
  const date = entry.entry.fields?.date
  let authorName = ''
  if (author) {
    const { family, given, prefix, literal } = author?.[0]
    if (literal) {
      authorName = literal.map(o => o.text).join(' ')
    } else {
      const authorPrefix = prefix ? `${prefix.map(o => o.text).join(' ')} ` : ''
      const authorNames = []
      if (given) {
        authorNames.push(given.map(o => o.text).join(' '))
      }
      if (family) {
        authorNames.push(family.map(o => o.text).join(' '))
      }
      authorName = `${authorPrefix}${authorNames.join(', ')}`
    }
  }
  return (
    <div
      className={styles.reference}
    >
      <ReferenceTypeIcon type={type} className={styles.referenceTypeIcon} />
      <div className={styles.referenceInfo}>
        <p className={styles.referencePrimaryInfo} title={authorName + " | " + title}>
          {authorName && <div className={styles.referenceAuthor}>{authorName}</div>}
          <div className={styles.referenceTitle} title={title}>{title}</div>
          <div className={styles.referenceDate}>{date}</div>
        </p>
        <p className={styles.referenceSecondaryInfo}>
          <span className={styles.referenceKey} title={"@" + key}>@{key}</span>
        </p>
      </div>
      <CopyToClipboard text={`[@${key}]`}>
        <Button title="Copy to clipboard" className={styles.copyToClipboard} icon={true}><Clipboard /></Button>
      </CopyToClipboard>
    </div>
  )
}
