import clsx from 'clsx'
import React, { forwardRef, useEffect, useId, useRef } from 'react'
import styles from './field.module.scss'

export default forwardRef(function Field(
  {
    hasError,
    className,
    prefix,
    children,
    label,
    id = useId(),
    type = 'text',
    autoFocus = false,
    ...otherProps
  },
  forwardedRef
) {
  const inputRef = forwardedRef ?? useRef()
  const classNames = clsx(
    styles.field,
    prefix && styles.withPrefix,
    'control-field',
    className && className,
    hasError && styles.error
  )

  const computedStyles = { '--chars-count': prefix?.length }
  useEffect(() => {
    if (autoFocus) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className={classNames}>
      {label && <label htmlFor={id}>{label}</label>}
      <div
        className={clsx('control', otherProps.icon && 'has-icons-left')}
        style={computedStyles}
      >
        {children && { ...children }}
        {!children && (
          <>
            {prefix && <span className={styles.prefix}>{prefix}</span>}
            <input
              {...otherProps}
              id={id}
              className="input"
              type={type}
              ref={inputRef}
            />
            {otherProps.icon && (
              <span className="icon is-small is-left" aria-hidden>
                <otherProps.icon />
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
})
