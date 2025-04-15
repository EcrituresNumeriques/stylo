import React from 'react'

import styles from './CollaborativeEditorStatus.module.scss'
import CollaborativeEditorWriters from './CollaborativeEditorWriters.jsx'
import CollaborativeEditorActiveVersion from './CollaborativeEditorActiveVersion.jsx'

/**
 * @param {object} props
 * @param {string|undefined} props.versionId
 * @returns {Element}
 */
export default function CollaborativeEditorStatus({ versionId }) {
  return (
    <>
      <div className={styles.row}>
        <CollaborativeEditorActiveVersion versionId={versionId} />
        <div className={styles.writers}>
          <CollaborativeEditorWriters />
        </div>
      </div>
    </>
  )
}
