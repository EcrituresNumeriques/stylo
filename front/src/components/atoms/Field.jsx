import clsx from 'clsx'
import React, { forwardRef, useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import styles from './Field.module.scss'

export default forwardRef(function Field(
  {
    hasError,
    className,
    children,
    mandatory = false,
    label,
    id = useId(),
    type = 'text',
    autoFocus = false,
    isLoading = false,
    ...otherProps
  },
  forwardedRef
) {
  const inputRef = forwardedRef ?? useRef()
  const { t } = useTranslation()
  const classNames = clsx(
    styles.field,
    'control-field',
    className && className,
    hasError && styles.error
  )

  const { icon, ...inputProps } = otherProps

  useEffect(() => {
    if (autoFocus) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className={classNames}>
      {label && (
        <label htmlFor={id} aria-label={`${label} (${t('field.mandatory')})`}>
          {label}
          {mandatory && (
            <span className={styles.mandatoryHelper} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className={clsx('control', icon && 'has-icons-left')}>
        {children && { ...children }}
        {!children && (
          <>
            <input
              {...inputProps}
              id={id}
              required={otherProps.required || mandatory}
              className="input"
              type={type}
              ref={inputRef}
              disabled={isLoading}
            />
            {icon && (
              <span className="icon is-small is-left" aria-hidden>
                {icon}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
})
