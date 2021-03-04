import React, { useState } from 'react'
import styles from './button.module.scss'

import uniqueId from 'lodash/uniqueId'

export default function Select (props) {
  const [id] = useState(() => uniqueId('select-'))
  const classNames = [
    styles.select
  ]
  if (props.className) {
    classNames.push(props.className)
  }
  return (<div className={styles.selectContainer}>
    {props.label && <label htmlFor={id} className={styles.label}>{props.label}</label>}
    <select id={id} className={classNames.join(' ')} {...props}>
      {props.children}
    </select>
  </div>)
}
