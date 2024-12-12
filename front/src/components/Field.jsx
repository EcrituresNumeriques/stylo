import clsx from 'clsx'
import React, { forwardRef, useId } from 'react'
import styles from './field.module.scss'

/**
 * @typedef {Object} FieldInput
 * @property {string} label
 * @property {string=} type
 * @property {string=} id
 * @property {boolean=} hasError
 * @property {string=} className
 * @property {string=} prefix
 * @property {React.ReactNode[]=} children
 */

/**
 * @param {React.ReactHTMLElement(props: FieldInput)} node
 * @param {React.ForwardedRef} forwardedRef
 * @return {React.ForwardRefRenderFunction}
 */
export default forwardRef(function Field(
  {
    hasError,
    className,
    prefix,
    children,
    label,
    id,
    type = 'text',
    ...otherProps
  },
  forwardedRef
) {
  const uid = `field-${id ?? useId()}`
  const classNames = [
    styles.field,
    prefix && styles.withPrefix,
    'control-field',
  ]

  if (className) {
    classNames.push(className)
  }
  if (hasError) {
    classNames.push(styles.error)
  }

  const computedStyles = { '--chars-count': prefix?.length }

  return (
    <div className={clsx(classNames)}>
      {label && <label htmlFor={uid}>{label}</label>}
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
              id={uid}
              className="input"
              type={type || 'text'}
              ref={forwardedRef}
            />
            {otherProps.icon && (
              <span className="icon is-small is-left">
                <otherProps.icon />
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
})
