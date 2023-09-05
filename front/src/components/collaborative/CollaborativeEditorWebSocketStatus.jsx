import React from 'react'
import PropTypes from 'prop-types'
import { Dot, Loading } from '@geist-ui/core'


import styles from './CollaborativeEditorWebSocketStatus.module.scss'

export default function CollaborativeEditorWebSocketStatus ({ status }) {
  return (
    <>
      {status === 'connected' && <Dot type="success" className={styles.dot}>Connected</Dot>}
      {status === 'disconnected' && <Dot type="error" className={styles.dot}>Disconnected</Dot>}
      {status === 'connecting' && <Dot type="warning" className={styles.dot}>Connecting <Loading/></Dot>}
    </>
  )
}

CollaborativeEditorWebSocketStatus.propTypes = {
  status: PropTypes.string.isRequired
}
