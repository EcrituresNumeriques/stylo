import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { X } from 'react-feather'
import Button from './Button'

import styles from './modal.module.scss'

const noop = () => {}

export default function Modal ({ children, cancel = noop}) {
  const ref = useRef()
  useEffect(() => ref.current.showModal(), [])

  return (
    <dialog open={false} className={styles.modal} ref={ref} onClose={cancel}>
      <Button
        aria-label="Close modal"
        icon={true}
        className={[styles.secondary, styles.closeButton].join(' ')}
        onClick={cancel}
      >
        <X aria-hidden />
      </Button>

      {children}
    </dialog>
  )
}

Modal.propTypes = {
  cancel: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
}
