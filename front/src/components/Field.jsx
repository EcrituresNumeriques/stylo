import clsx from 'clsx'
import React, { forwardRef } from 'react'
import styles from './field.module.scss'

export default forwardRef(function Field (props, forwardedRef) {
  const type = props.type ? props.type : 'text'
  const classNames = [
    styles.field,
    props.prefix && styles.withPrefix,
    'control-field'
  ]

  if (props.className) {
    classNames.push(props.className)
  }

  const computedStyles = {'--chars-count': props.prefix?.length}

  return (<div className={clsx(classNames)}>
    {props.label && <label htmlFor={props.id}>{props.label}</label>}
    <div className={clsx('control', props.icon && "has-icons-left")} style={computedStyles}>
      {props.children && {...props.children}}
      {!props.children && <>
        {props.prefix && <span className={styles.prefix}>{props.prefix}</span>}
        <input {...props} className="input" type={type} ref={forwardedRef} />
          {props.icon && <span className="icon is-small is-left">
            <props.icon/>
          </span>}
        </>}
    </div>
  </div>)
})
