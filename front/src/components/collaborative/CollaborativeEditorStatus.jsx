import React from 'react'

import styles from './CollaborativeEditorStatus.module.scss'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'

/**
 * @return {Element}
 */
export default function CollaborativeEditorStatus() {
  return (
    <>
      <div className={styles.row}>
        <div className={styles.writers}>
          <CollaborativeEditorWriters />
        </div>
      </div>
    </>
  )
}
