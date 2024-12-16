import React from 'react'
import clsx from 'clsx'
import { Loader } from 'react-feather'

import styles from './loading.module.scss'

export default function Loading({
  label = 'Loading',
  inline = false,
  size = 42,
  hidden = false,
}) {
  return (
    <div
      className={clsx(styles.loading, inline && styles.inline)}
      hidden={hidden}
    >
      <Loader size={size} aria-hidden />
      {label}…
    </div>
  )
}
