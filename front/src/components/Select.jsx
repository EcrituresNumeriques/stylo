import { clsx } from 'clsx'
import React, { forwardRef } from 'react'

import styles from './button.module.scss'
import fieldStyles from './field.module.scss'

export default forwardRef(function Select (props, forwardedRef) {
  return (
    <div
      className={clsx(fieldStyles.field, 'control-field')}
      ref={forwardedRef}
    >
      {props.label && <label htmlFor={props.id}>{props.label}</label>}
      <div
        className={clsx(
          styles.selectContainer,
          props.disabled && styles.selectDisabled
        )}
      >
        <select className={props.className || styles.select} {...props}>
          {props.children}
        </select>
      </div>
    </div>
  )
})