import React from 'react'
import clsx from 'clsx'
import { Loader } from 'lucide-react'

import styles from './Loading.module.scss'

/**
 * @typedef {Object} LoadingProps
 * @property {string=} label (default: 'Loading…')
 * @property {boolean=} inline (default: false)
 * @property {boolean=} hidden (default: false)
 */

/**
 * @param {LoadingProps} props
 * @returns {React.ReactHTMLElement}
 */
export default function Loading({
  label = 'Loading…',
  size = '1rem',
  hidden = false,
}) {
  return (
    <div
      className={clsx(styles.loading)}
      style={{ fontSize: size }}
      hidden={hidden}
    >
      <Loader className={styles.icon} aria-hidden />
      {label}
    </div>
  )
}
