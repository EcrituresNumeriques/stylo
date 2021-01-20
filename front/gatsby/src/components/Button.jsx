import React from 'react'
import styles from './button.module.scss'

export default (props) => {
  const className = props.primary ? styles.primary : styles.secondary
  const classNames = [
    styles.button,
    className
  ]
  if (props.className) {
    classNames.push(props.className)
  }
  return (<button className={classNames.join(' ')} type={props.type} title={props.title} onClick={props.onClick}>{props.children}</button>)
}
