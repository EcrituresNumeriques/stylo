import clsx from 'clsx'
import { Children, useCallback, useEffect, useState } from 'react'

import { useKeyPress } from '../../hooks/events.js'

import styles from './Toggle.module.scss'

/**
 * @typedef {object} ToggleSwitchProps
 * @property {boolean} [checked=false]
 * @property {boolean} [disabled=false]
 * @property {string} [id]
 * @property {{true: string, false: string}} [labels]
 * @property {string} [name]
 * @property {(value: boolean) => void} [onChange]
 */

/**
 * @typedef {React.PropsWithChildren & ToggleSwitchProps} ComponentProps
 */

/**
 *
 * @param {ComponentProps} props
 * @returns {React.ReactElement}
 */
export default function ToggleSwitch({
  checked = false,
  children,
  disabled = false,
  id,
  labels = {},
  name,
  onChange = () => {},
  className,
}) {
  const [isChecked, setChecked] = useState(checked)
  const [isActive, setActiveState] = useState(false)
  const setActive = useCallback(() => setActiveState(true), [])
  const setInactive = useCallback(() => setActiveState(false), [])
  const a11yLabel = labels[isChecked] ? labels[isChecked] : null

  useEffect(() => {
    setChecked(checked)
  }, [checked])

  const toggle = useCallback(() => {
    setActive()
    const newValue = !isChecked
    setChecked(newValue)
    onChange(newValue)
  }, [isChecked, onChange])

  const handleKeyEvents = useKeyPress(['Enter', 'Space'], toggle)

  if (!a11yLabel && !Children.count(children)) {
    console.warn(
      'This component is not accessible as it lacks a label (either as a child node or with the `labels` props).'
    )
  }

  return (
    <label
      className={clsx(
        styles.element,
        isActive && styles.elementActive,
        disabled && styles.elementDisabled,
        className
      )}
    >
      <input
        id={id}
        disabled={disabled}
        name={name}
        className={styles.input}
        checked={isChecked}
        onFocus={setActive}
        onBlur={setInactive}
        onKeyDown={handleKeyEvents}
        onChange={toggle}
        type="checkbox"
        role="switch"
        aria-label={a11yLabel}
      />

      <span className={styles.state}>
        <span className={styles.stateContainer}>
          <span className={styles.position} />
        </span>

        <span className={styles.label} aria-hidden={!a11yLabel}>
          {Children.count(children) ? children : a11yLabel}
        </span>
      </span>
    </label>
  )
}
