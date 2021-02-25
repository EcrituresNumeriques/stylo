import React from 'react'
import { Loader } from 'react-feather'

import styles from './loading.module.scss'

export default function Loading (props) {
  return (<div className={styles.loading}>
    <Loader size="42" />
    Loading…
  </div>)
}
