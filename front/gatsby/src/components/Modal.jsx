import React from 'react'
import Button from './Button'

import styles from './modal.module.scss'

export default (props) => {
  const defaultCancel = () => {}
  const cancel = props.cancel || defaultCancel

  return (
    <>
      <section className={styles.background} onClick={() => cancel()}></section>
      <article className={styles.modal}>
        {props.children}

        <Button className={styles.secondary} onClick={() => cancel()}>
          Cancel
        </Button>
      </article>
    </>
  )
}
