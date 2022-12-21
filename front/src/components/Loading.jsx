import React from 'react'
import clsx from 'clsx'
import { Loader } from 'react-feather'

import styles from './loading.module.scss'

export default function Loading ({ label = 'Loading', inline = false, size = 42 }) {
  return (<div className={clsx(styles.loading, inline && styles.inline)}>
    <Loader size={size} aria-hidden />
    {label}…
  </div>)
}
