import React from 'react'
import { X } from 'react-feather'
import Button from './Button'

import styles from './modal.module.scss'

export default ({ children, cancel = () => {}, withCancelButton = true, withCloseButton = true }) => {
  return (
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
  )
}
