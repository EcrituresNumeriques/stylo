import React,{useState, useEffect} from 'react'
import {CopyToClipboard} from 'react-copy-to-clipboard';

import styles from './reference.module.scss'

export default props => {

  const [copied, setCopied] = useState(false)
  useEffect(()=>{
    if(copied){
      setCopied(false)
    }
  },[copied])

  return (
    <CopyToClipboard text={`[@${props.cle}]`} onCopy={()=>setCopied(true)}>
      <p className={`${styles.reference} ${copied?styles.clicked:null}`}>
        <span>@{props.cle}</span>
      </p>
    </CopyToClipboard>
  )
}