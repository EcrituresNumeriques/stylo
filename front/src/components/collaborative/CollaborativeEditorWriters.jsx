import React from 'react'
import { Avatar, Tooltip } from '@geist-ui/core'
import { useSelector } from 'react-redux'

import styles from './CollaborativeEditorWriters.module.scss'

export default function CollaborativeEditorWriters() {
  const articleWriters = useSelector((state) => state.articleWriters)

  return (
    <Avatar.Group>
      {Object.entries(articleWriters).map(([key, writer]) => {
        return (
          <Tooltip
            key={key}
            text={writer.user?.displayName}
            className={styles.avatar}
            placement="topStart"
            leaveDelay={0}
          >
            <Avatar text={writer.user?.displayName} stacked />
            <div
              className={styles.dot}
              style={{ backgroundColor: writer.user?.color }}
            />
          </Tooltip>
        )
      })}
    </Avatar.Group>
  )
}
