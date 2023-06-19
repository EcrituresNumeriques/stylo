import clsx from 'clsx'
import React, { forwardRef } from 'react'
import styles from './field.module.scss'

export default forwardRef(function Field ({hasError, className, prefix, children, label, icon, id, type, ...otherProps}, forwardedRef) {
  const classNames = [
    styles.field,
    prefix && styles.withPrefix,
    'control-field'
  ]

  if (className) {
    classNames.push(className)
  }
  if (hasError) {
    classNames.push(styles.error)
  }

  const computedStyles = {'--chars-count': prefix?.length}

  return (<div className={clsx(classNames)}>
    {label && <label htmlFor={id}>{label}</label>}
    <div className={clsx('control', icon && "has-icons-left")} style={computedStyles}>
      {children && {...children}}
      {!children && <>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input {...otherProps} className="input" type={type || 'text'} ref={forwardedRef} />
          {icon && <span className="icon is-small is-left">
            <icon/>
          </span>}
        </>}
    </div>
  </div>)
})
