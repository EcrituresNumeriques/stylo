import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { X } from 'react-feather'
import Button from './Button'

import styles from './modal.module.scss'

const noop = () => {}

export default function Modal({ title, children, cancel = noop }) {
  const ref = useRef()

  useEffect(() => {
    ref.current.showModal()
    document.body.setAttribute('data-scrolling', false)

    return function cleanup() {
      document.body.removeAttribute('data-scrolling')
    }
  }, [])

  return (
    <dialog
      open={false}
      className={styles.modal}
      ref={ref}
      onClose={cancel}
      aria-labelledby="modal-title"
    >
      <Button
        aria-label="Close modal"
        icon={true}
        className={[styles.secondary, styles.closeButton].join(' ')}
        onClick={cancel}
      >
        <X aria-hidden />
      </Button>

      <h1 id="modal-title" className={styles.title}>
        {title}
      </h1>

      <div className={styles.modalBody}>{children}</div>
    </dialog>
  )
}

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  cancel: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}
