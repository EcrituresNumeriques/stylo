import React, { forwardRef } from 'react'
import { X } from 'react-feather'
import { useTranslation } from 'react-i18next'
import Button from './Button'

import styles from './modal.module.scss'

const noop = () => {}

export default forwardRef(function Modal(
  { title, children, cancel = noop },
  forwardedRef
) {
  const { t } = useTranslation()
  return (
    <dialog
      open={false}
      className={styles.modal}
      ref={forwardedRef}
      onClose={cancel}
      aria-labelledby="modal-title"
    >
      <header className={styles.modalHeader}>
        <Button
          aria-label={t('modal.close.label')}
          icon={true}
          link={true}
          className={styles.closeButton}
          onClick={cancel}
        >
          {t('modal.close.text')} <X aria-hidden />
        </Button>

        <h1 id="modal-title" className={styles.title}>
          {title}
        </h1>
      </header>

      <div>{children}</div>
    </dialog>
  )
})
