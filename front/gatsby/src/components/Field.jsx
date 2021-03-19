import React, { useState } from 'react'
import styles from './field.module.scss'

import uniqueId from 'lodash/uniqueId'

export default (props) => {
  const [id] = useState(() => uniqueId('input-'))
  const type = props.type ? props.type : 'text'
  const classNames = [
    styles.field
  ]
  if (props.className) {
    classNames.push(props.className)
  }

  return (<div className={classNames.join(' ')}>
    {props.label && <label htmlFor={id}>{props.label}</label>}
    <p className={`control${props.icon ? " has-icons-left" : ""}`}>
      {props.children && {...props.children}}
      {!props.children && <>
        <input {...props} id={id} className="input" type={type} />
          {props.icon && <span className="icon is-small is-left">
            <props.icon/>
          </span>}
        </>}
    </p>
  </div>)
}



