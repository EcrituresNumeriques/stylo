import React, { useCallback } from 'react'

import styles from './Share.module.scss'
import ContactSearch from './ContactSearch.jsx'
import { useToasts } from '@geist-ui/core'
import { Send } from 'react-feather'

export default function ArticleSendCopy ({ article }) {
  const { setToast } = useToasts()

  const handleUserUpdated = useCallback(async ({ user, action }) => {
    const { _id: userId } = user
    if (action === 'select' || action === 'unselect') {
      setToast({
        text: `Copie de l'article envoyée à ${user.displayName || user.username}.`,
        type: 'success',
      })
    }
  }, [article._id])

  return (
    <section className={styles.acquintances}>
      <ContactSearch
        selectedIcon={<Send/>}
        unselectedIcon={<Send/>}
        onUserUpdated={handleUserUpdated}
      />
    </section>
  )
}
