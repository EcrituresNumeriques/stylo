import clsx from 'clsx'
import { Loader } from 'lucide-react'

import styles from './CollaborativeEditorWebSocketStatus.module.scss'

/**
 * @param {object} props
 * @param {string} props.status
 * @returns {JSX.Element}
 * @class
 */
export default function CollaborativeEditorWebSocketStatus({ status }) {
  if (status === 'connected') {
    return <></>
  }

  if (status === 'connecting') {
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
