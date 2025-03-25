import clsx from 'clsx'
import React from 'react'
import { Loader } from 'react-feather'

import styles from './CollaborativeEditorWebSocketStatus.module.scss'

/**
 * @param props
 * @param {string} props.status
 * @param {string} props.state
 * @return {Element}
 * @constructor
 */
export default function CollaborativeEditorWebSocketStatus({ status, state }) {
  if (status === 'connected') {
    return <></>
  }

  if (state !== 'started' || status === 'connecting') {
    return (
      <div className={clsx(styles.status, styles.connecting)}>
        <span className={clsx(styles.dot, styles.warning)}></span>
        Connecting
        <Loader className={styles.loadingIndicator} />
      </div>
    )
  }

  return (
    <div className={clsx(styles.status, styles.disconnected)}>
      {status === 'disconnected' && (
        <>
          <span className={clsx(styles.dot, styles.info)}></span>
          Disconnected
        </>
      )}
    </div>
  )
}
