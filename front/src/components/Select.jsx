import React from 'react'
import styles from './button.module.scss'

export default function Select (props) {
  const classNames = [
    styles.select
  ]
  if (props.className) {
    classNames.push(props.className)
  }
  return (<div className={styles.selectContainer}><select className={classNames.join(' ')} {...props}>{props.children}</select></div>)
}
