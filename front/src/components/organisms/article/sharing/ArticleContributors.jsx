import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { useArticleContributorActions } from '../../../../hooks/contributor.js'

import ContactSearch from '../../contact/ContactSearch.jsx'

import styles from './ArticleContributors.module.scss'

export default function ArticleContributors({ article, contributors }) {
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
          toast(
            t('article.contributors.added', {
              name: user.displayName || user.username,
            }),
            { type: 'info' }
          )
        } catch (err) {
          toast(String(err), {
            type: 'error',
          })
        }
      } else if (action === 'unselect') {
        try {
          await removeContributor(userId)
          toast(
            t('article.contributors.removed', {
              name: user.displayName || user.username,
            }),
            { type: 'info' }
          )
        } catch (err) {
          toast(String(err), { type: 'error' })
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
