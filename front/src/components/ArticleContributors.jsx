import React, { useCallback } from 'react'

import styles from './Share.module.scss'
import ContactSearch from './ContactSearch.jsx'
import { useGraphQL } from '../helpers/graphQL.js'
import { addContributor, removeContributor } from './ArticleContributors.graphql'

export default function ArticleContributors ({ article }) {
  const runQuery = useGraphQL()

  const handleUserUpdated = useCallback(async ({ user, action }) => {
    const { _id: userId } = user
    if (action === 'select') {
      // add contributor
      const data = await runQuery({ query: addContributor, variables: { userId, articleId: article._id } })
      // QUESTION: show notification? what about errors?
    } else if (action === 'unselect') {
      // remove contributor
      const data = await runQuery({ query: removeContributor, variables: { userId, articleId: article._id } })
      // QUESTION: show notification?  what about errors?
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
