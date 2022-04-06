import React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'react-feather'
import Button from './Button'

import styles from './modal.module.scss'

const modalRoot = window.document.querySelector('#modal-root')

export default function Modal ({ children, cancel = () => {}, withCancelButton = true, withCloseButton = true }) {
  return createPortal(
    <>
      <section className={styles.background} onClick={() => cancel()}></section>
      <article className={styles.modal}>
        {withCloseButton && <Button icon={true} className={[styles.secondary, styles.closeButton].join(' ')} onClick={() => cancel()}>
          <X/>
        </Button>}
        {children}
        {withCancelButton && <Button className={styles.secondary} onClick={() => cancel()}>
          Cancel
        </Button>}
      </article>
    </>
  , modalRoot)
}
