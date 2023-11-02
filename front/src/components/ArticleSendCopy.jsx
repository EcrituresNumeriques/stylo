import React, { useCallback } from 'react'

import { useToasts } from '@geist-ui/core'
import { Send } from 'react-feather'
import { useTranslation } from 'react-i18next'

import {
  duplicateArticle
} from './Article.graphql'

import styles from './articleSendCopy.module.scss'
import ContactSearch from './ContactSearch.jsx'
import {useMutation} from '../hooks/graphql.js'

export default function ArticleSendCopy ({ article }) {
  const { setToast } = useToasts()
  const mutation = useMutation()
  const { t } = useTranslation()

  const handleUserUpdated = useCallback(async ({ user, action }) => {
    if (action === 'select' || action === 'unselect') {
      try {
        await mutation({
          query: duplicateArticle,
          variables: {user: null, to: user._id, article: article._id}
        })
        setToast({
          text: t('article.sendCopy.successNotification', {username: user.displayName || user.username}), 
          type: 'success',
        })
      } catch (err) {
        setToast({
          type: 'error',
          text: t('article.sendCopy.error')` ${err.message}`
        })
      }
    }
  }, [article._id])

  return (
    <section className={styles.acquintances}>
      <ContactSearch
        selectedIcon={<Send/>}
        unselectedIcon={<Send/>}
        onUserUpdated={handleUserUpdated}
        members={[]}
      />
    </section>
  )
}
