import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useKeyPress } from '../../hooks/events.js'
import styles from './Toggle.module.scss'

/**
 * @typedef {object} ToggleSwitchProps
 * @property {string} labelKey
 * @property {string} name
 * @property {boolean} [checked=false]
 * @property {boolean} [disabled=false]
 * @property {string} [id]
 * @property {string} [value]
 * @property {(value: boolean) => void} [onChange]
 */

/**
 *
 * @param {ToggleSwitchProps & React.} props
 * @returns {React.ReactElement}
 */
export default function ToggleSwitch({
  checked = false,
  disabled = false,
  id,
  labelKey = null,
  name,
  onChange = () => {},
  className,
  value = null,
  t = null,
}) {
  const [isChecked, setChecked] = useState(checked)
  const [isActive, setActiveState] = useState(false)
  const setActive = useCallback(() => setActiveState(true), [])
  const setInactive = useCallback(() => setActiveState(false), [])
  const { t: _t } = useTranslation()
  const tFunc = t ?? _t

  const a11yLabel = tFunc(labelKey, {
    context: isChecked ? 'checked' : 'unchecked',
  })

  let uiLabel = a11yLabel

  if (labelKey !== tFunc(labelKey)) {
    uiLabel = tFunc(labelKey)
  }

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
        value={value}
        aria-label={a11yLabel}
      />

      <span className={styles.state} aria-hidden="true">
        <span className={styles.stateContainer}>
          <span className={styles.position} />
        </span>

        <span className={styles.label}>{uiLabel}</span>
      </span>
    </label>
  )
}
