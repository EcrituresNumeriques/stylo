import React, { useCallback } from 'react'
import { useArticleContributorActions } from '../hooks/contributor.js'

import styles from './articleContributors.module.scss'
import ContactSearch from './ContactSearch.jsx'

import { useToasts } from '@geist-ui/core'
import { useTranslation } from 'react-i18next'

export default function ArticleContributors({ article, contributors }) {
  const { setToast } = useToasts()
  const { t } = useTranslation()
  const articleId = article._id
  const { addContributor, removeContributor } = useArticleContributorActions({
    articleId,
  })
  const handleUserUpdated = useCallback(
    async ({ user, action }) => {
      const { _id: userId } = user
      if (action === 'select') {
        // add contributor
        try {
          await addContributor(userId)
          setToast({
            text: t('article.contributors.added', {
              name: user.displayName || user.username,
            }),
            type: 'default',
          })
        } catch (err) {
          setToast({
            text: String(err),
            type: 'error',
          })
        }
      } else if (action === 'unselect') {
        try {
          await removeContributor(userId)
          setToast({
            text: t('article.contributors.removed', {
              name: user.displayName || user.username,
            }),
            type: 'default',
          })
        } catch (err) {
          setToast({
            text: String(err),
            type: 'error',
          })
        }
      }
    },
    [articleId]
  )

  return (
    <section className={styles.acquintances}>
      <ContactSearch
        members={contributors.map((c) => c.user)}
        onUserUpdated={handleUserUpdated}
      />
    </section>
  )
}
