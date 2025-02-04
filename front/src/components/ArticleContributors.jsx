import React, { useCallback } from 'react'
import { useArticleContributorActions } from '../hooks/contributor.js'
import { useMutate, useMutation } from '../hooks/graphql.js'

import styles from './articleContributors.module.scss'
import ContactSearch from './ContactSearch.jsx'

import { getArticleContributors } from './Article.graphql'
import { useToasts } from '@geist-ui/core'

export default function ArticleContributors({ article, contributors }) {
  const { setToast } = useToasts()
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
            text: `Contributeur ${
              user.displayName || user.username
            } ajouté à l'article.`,
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
            text: `Contributeur ${
              user.displayName || user.username
            } supprimé de l'article.`,
            type: 'warning',
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
