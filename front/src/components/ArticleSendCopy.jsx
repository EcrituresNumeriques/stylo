import React, { useCallback } from 'react'

import { useToasts } from '@geist-ui/core'
import { Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import styles from './articleSendCopy.module.scss'
import ContactSearch from './ContactSearch.jsx'
import { useArticleActions } from '../hooks/article.js'

export default function ArticleSendCopy({ article }) {
  const { setToast } = useToasts()
  const { copy } = useArticleActions({ articleId: article._id })
  const { t } = useTranslation()

  const handleUserUpdated = useCallback(
    async ({ user, action }) => {
      if (action === 'select' || action === 'unselect') {
        try {
          await copy(user._id)
          setToast({
            text: t('article.sendCopy.successNotification', {
              username: user.displayName || user.username,
            }),
            type: 'success',
          })
        } catch (err) {
          setToast({
            type: 'error',
            text: t('article.sendCopy.errorNotification', {
              errMessage: err.message,
            }),
          })
        }
      }
    },
    [article._id]
  )

  return (
    <section className={styles.acquintances}>
      <ContactSearch
        selectedIcon={<Send />}
        unselectedIcon={<Send />}
        onUserUpdated={handleUserUpdated}
        members={[]}
      />
    </section>
  )
}
