import React, { forwardRef } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from './Button'

import styles from './modal.module.scss'

const noop = () => {}

/**
 * @param props
 * @param {string} props.title
 * @param {RefObject} props.ref
 * @param {boolean=} props.visible
 * @param {string} props.subtitle
 * @param {Element} props.children
 * @param {() => void} props.cancel
 */
export default forwardRef(function Modal(
  { title, subtitle = '', children, cancel = noop, visible = true },
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
      {visible && (
        <div className={styles.content}>
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
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </header>

          <div>{children}</div>
        </div>
      )}
    </dialog>
  )
})
