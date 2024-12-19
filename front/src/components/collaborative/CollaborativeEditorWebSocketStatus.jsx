import React from 'react'
import PropTypes from 'prop-types'
import { Dot } from '@geist-ui/core'
import { Loader } from 'react-feather'

import styles from './CollaborativeEditorWebSocketStatus.module.scss'

export default function CollaborativeEditorWebSocketStatus({ status, state }) {
  if (state !== 'started') {
    return (
      <Dot type="warning" className={styles.dot}>
        Connecting
        <Loader className={styles.loadingIndicator} />
      </Dot>
    )
  }
  return (
    <>
      {status === 'connected' && (
        <Dot type="success" className={styles.dot}>
          Connected
        </Dot>
      )}
      {status === 'disconnected' && (
        <Dot type="error" className={styles.dot}>
          Disconnected
        </Dot>
      )}
      {status === 'connecting' && (
        <Dot type="warning" className={styles.dot}>
          Connecting
          <Loader className={styles.loadingIndicator} />
        </Dot>
      )}
    </>
  )
}

CollaborativeEditorWebSocketStatus.propTypes = {
  state: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
}
