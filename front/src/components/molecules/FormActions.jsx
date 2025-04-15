import React from 'react'
import { useTranslation } from 'react-i18next'

import Button from '../Button.jsx'

import styles from './FormActions.module.scss'

/**
 * @typedef ButtonInfo
 * @type {object}
 * @property {string} text
 * @property {string|undefined} label
 * @property {string|undefined} title
 */

/**
 * @param props
 * @param {function} props.onSubmit
 * @param {function} props.onCancel
 * @param {ButtonInfo|undefined} props.cancelButton
 * @param {ButtonInfo|undefined} props.submitButton
 * @constructor
 */
export default function FormActions({
  onSubmit,
  onCancel,
  cancelButton,
  submitButton,
}) {
  const { t } = useTranslation()
  return (
    <div className={styles.actions}>
      <Button
        onClick={onCancel}
        secondary
        aria-label={cancelButton?.label ?? t('modal.cancelButton.label')}
        title={cancelButton?.title && t(cancelButton.title)}
      >
        {t(cancelButton?.text ?? 'modal.cancelButton.text')}
      </Button>
      <Button
        onClick={onSubmit && (() => onSubmit())}
        primary
        disabled={submitButton?.disabled || false}
        aria-label={submitButton?.label && t(submitButton.label)}
        title={submitButton?.title && t(submitButton.title)}
      >
        {t(submitButton?.text ?? 'modal.confirmButton.text')}
      </Button>
    </div>
  )
}
