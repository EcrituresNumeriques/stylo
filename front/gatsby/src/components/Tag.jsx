import React from 'react'
import styles from './tag.module.scss'

export default (props) => {
  const classNames = [
    styles.tag,
    props.data.selected ? styles.selected : null
  ].join(' ')

  const color = props.data.color || 'grey'
  return (<label className={classNames} title={props.title}>
    <input name={props.key} type="checkbox" checked={props.data.selected} onChange={props.onClick} />
    {props.data.name}
    <span className={styles.chip} style={{backgroundColor: color}}/>
  </label>)
}
