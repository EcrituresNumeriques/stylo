import React, { useId } from 'react'

import styles from './Checkbox.module.scss'

/**
 * @typedef {Object} CheckboxProps
 * @property {(event: React.ChangeEvent) => undefined} onChange
 * @property {string} name
 * @property {string} value
 * @property {string=} color
 * @property {boolean=} readonly
 * @property {boolean=} defaultChecked
 */

/**
 * @param {React.PropsWithChildren<CheckboxProps>} props
 * @returns
 */
export default function Checkbox({
  onChange,
  name,
  value,
  defaultChecked = false,
  color = null,
  readonly = false,
  children,
}) {
  const id = `input-checkbox-${useId()}`

  return (
    <label className={styles.label} htmlFor={id}>
      <input
        id={id}
        name={name}
        value={value}
        type="checkbox"
        defaultChecked={defaultChecked}
        onChange={onChange}
        hidden={readonly}
      />
      {children}

      {color && (
        <span
          className={styles.chip}
          style={{ backgroundColor: color }}
          role="presentation"
        />
      )}
    </label>
  )
}
