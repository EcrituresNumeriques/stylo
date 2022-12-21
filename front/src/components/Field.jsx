import clsx from 'clsx'
import React, { forwardRef } from 'react'
import styles from './field.module.scss'

const Field = forwardRef((props, forwardedRef) => {
  const type = props.type ? props.type : 'text'
  const classNames = [
    styles.field,
    'control-field'
  ]

  if (props.className) {
    classNames.push(props.className)
  }

  return (<div className={clsx(classNames)} ref={forwardedRef}>
    {props.label && <label htmlFor={props.id}>{props.label}</label>}
    <p className={clsx('control', props.icon && "has-icons-left")}>
      {props.children && {...props.children}}
      {!props.children && <>
        <input {...props} className="input" type={type} />
          {props.icon && <span className="icon is-small is-left">
            <props.icon/>
          </span>}
        </>}
    </p>
  </div>)
})

Field.displayName = 'Field'

export default Field
