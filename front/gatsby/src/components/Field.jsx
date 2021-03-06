import React from 'react'
import styles from './field.module.scss'

export default (props) => {
  const type = props.type ? props.type : 'text'
  const classNames = [
    styles.field
  ]
  if (props.className) {
    classNames.push(props.className)
  }
  return (<div className={classNames.join(' ')}>
    {props.label && <label htmlFor={props.id}>{props.label}</label>}
    <p className={`control${props.icon ? " has-icons-left" : ""}`}>
      {props.children && {...props.children}}
      {!props.children && <>
        <input {...props} className="input" type={type} />
          {props.icon && <span className="icon is-small is-left">
            <props.icon/>
          </span>}
        </>}
    </p>
  </div>)
}



