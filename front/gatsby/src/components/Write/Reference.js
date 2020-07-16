import React,{useState, useEffect} from 'react'
import {CopyToClipboard} from 'react-copy-to-clipboard';

import styles from './reference.module.scss'

export default ({ entry }) => {
  const {key, title} = entry

  const [copied, setCopied] = useState(false)
  useEffect(()=>{
    if (copied) {
      setCopied(false)
    }
  }, [copied])

  return (
    <CopyToClipboard text={`[@${key}]`} onCopy={() => setCopied(true)}>
      <p className={`${styles.reference} ${copied ? styles.clicked: null}`} title={title}>
        <span>@{key}</span>
      </p>
    </CopyToClipboard>
  )
}