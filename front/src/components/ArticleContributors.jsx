import React, { useCallback, useMemo } from 'react'
import { useMutation } from '../hooks/graphql.js'

import styles from './articleContributors.module.scss'
import ContactSearch from './ContactSearch.jsx'
import {
  addContributor,
  removeContributor,
} from './ArticleContributors.graphql'
import { useToasts } from '@geist-ui/core'

export default function ArticleContributors({ article }) {
  const mutation = useMutation()
  const { setToast } = useToasts()
  const articleId = useMemo(() => article._id, [])

  const handleUserUpdated = useCallback(
    async ({ user, action }) => {
      const { _id: userId } = user
      if (action === 'select') {
        // add contributor
        try {
          await mutation({
            query: addContributor,
            variables: { userId, articleId },
          })
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
          await mutation({
            query: removeContributor,
            variables: { userId, articleId },
          })
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
        members={article.contributors.map((c) => c.user)}
        onUserUpdated={handleUserUpdated}
      />
    </section>
  )
}
