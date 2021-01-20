import React from 'react'
import styles from './field.module.scss'

export default (props) => {
  const type = props.type ? props.type : 'text'
  const classNames = [
    "input"
  ]
  if (props.className) {
    classNames.push(props.className)
  }
  return (<div className={styles.field}>
    <p className={`control${props.icon ? " has-icons-left" : ""}`}>
      <input className={classNames.join(' ')} type={type} placeholder={props.placeholder} onChange={props.onChange} value={props.value}/>
      {props.icon && <span className="icon is-small is-left">
        <props.icon/>
      </span>}
    </p>
  </div>)
}



