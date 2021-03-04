import React, { useState } from 'react'
import styles from './button.module.scss'

import uniqueId from 'lodash/uniqueId'

export default function Select (props) {
  const { className, containerClassName, label } = props
  const [id] = useState(() => uniqueId('select-'))
  const classNames = [
    styles.select
  ]
  if (className) {
    classNames.push(className)
  }
  return (<div className={[styles.selectContainer, containerClassName].join(' ')}>
    {label && <label htmlFor={id} className={styles.label}>{props.label}</label>}
    <select id={id} className={classNames.join(' ')} {...props}>
      {props.children}
    </select>
  </div>)
}
