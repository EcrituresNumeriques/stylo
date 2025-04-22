import React from 'react'
import { useSelector } from 'react-redux'

import Avatar from '../molecules/Avatar.jsx'

import styles from './CollaborativeEditorWriters.module.scss'

export default function CollaborativeEditorWriters() {
  const articleWriters = useSelector((state) => state.articleWriters)

  return (
    <div>
      {Object.entries(articleWriters).map(([key, writer]) => {
        return (
          <div key={key} className={styles.writer}>
            <Avatar text={writer.user?.displayName} />
            <div
              className={styles.dot}
              style={{ backgroundColor: writer.user?.color }}
            />
          </div>
        )
      })}
    </div>
  )
}
