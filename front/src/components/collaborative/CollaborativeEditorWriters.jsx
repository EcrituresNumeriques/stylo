import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import Avatar from '../molecules/Avatar.jsx'

import styles from './CollaborativeEditorWriters.module.scss'

export default function CollaborativeEditorWriters() {
  const articleWriters = useSelector((state) => state.articleWriters)
  const { t } = useTranslation()

  return (
    <ul aria-label={t('article.editors.label')} className={styles.avatarsList}>
      {Object.entries(articleWriters).map(([key, writer]) => {
        return (
          <li key={key} className={styles.writer}>
            <Avatar text={writer.user?.displayName} />
            <div
              className={styles.dot}
              style={{ backgroundColor: writer.user?.color ?? '#ccc' }}
            />
          </li>
        )
      })}
    </ul>
  )
}
