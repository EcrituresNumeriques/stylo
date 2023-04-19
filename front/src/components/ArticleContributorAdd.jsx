import React, { useCallback } from 'react'

import styles from './Share.module.scss'
import ContactSearch from './ContactSearch.jsx'
import { useGraphQL } from '../helpers/graphQL.js'
import { addContributor , removeContributor } from './ArticleContributors.graphql'

export default function ArticleContributorAdd ({ article }) {
  const runQuery = useGraphQL()

  const handleUserUpdated = useCallback(async ({userId, action}) => {
    if (action === 'select') {
      // add contributor
      const data = await runQuery({ query: addContributor, variables: { userId, articleId: article._id } })
    } else if (action === 'unselect') {
      // remove contributor
      const data = await runQuery({ query: removeContributor, variables: { userId, articleId: article._id } })
    } else if (action === 'active') {
      // add user to contacts
    } else if (action === 'inactive') {
      // remove user from contacts
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
