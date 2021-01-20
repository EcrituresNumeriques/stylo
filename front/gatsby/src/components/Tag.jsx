import React from 'react'
import styles from './tag.module.scss'

export default (props) => {
  const classNames = [
    styles.tag
  ]
  if (props.className) {
    classNames.push(props.className)
  }
  const color = props.data.color || 'grey'
  return (<span className={classNames.join(' ')} title={props.title} onClick={props.onClick}>
    <span style={{backgroundColor: color}}/> {props.data.name}
  </span>)
}
