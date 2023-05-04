import React, { useCallback } from 'react'

import styles from './Share.module.scss'
import ContactSearch from './ContactSearch.jsx'
import { useGraphQL } from '../helpers/graphQL.js'
import { addContributor, removeContributor } from './ArticleContributors.graphql'
import { useToasts } from '@geist-ui/core'

export default function ArticleContributors ({ article }) {
  const runQuery = useGraphQL()
  const { setToast } = useToasts()

  const handleUserUpdated = useCallback(async ({ user, action }) => {
    const { _id: userId } = user
    if (action === 'select') {
      // add contributor
      try {
        await runQuery({ query: addContributor, variables: { userId, articleId: article._id } })
        setToast({
          text: `Contributeur ${user.displayName || user.username} ajouté à l'article.`,
          type: 'default',
        })
      } catch (err) {
        setToast({
          text: err,
          type: 'error',
        })
      }
    } else if (action === 'unselect') {
      try {
        await runQuery({ query: removeContributor, variables: { userId, articleId: article._id } })
        setToast({
          text: `Contributeur ${user.displayName || user.username} supprimé de l'article.`,
          type: 'warning',
        })
      } catch (err) {
        setToast({
          text: err,
          type: 'error',
        })
      }
    }
  }, [article._id])

  return (
    <section className={styles.acquintances}>
      <ContactSearch
        members={article.contributors.map((c) => c.user)}
        onUserUpdated={handleUserUpdated}
      />
    </section>
  )
}
