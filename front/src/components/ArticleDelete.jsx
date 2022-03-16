import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'

import Button from './Button'

import styles from './articles.module.scss'
import { useGraphQL } from '../helpers/graphQL'

export default function ArticleDelete ({ setNeedReload, _id }) {
  const userId = useSelector(state => state.activeUser._id)
  const runQuery = useGraphQL()

  const deleteArticle = useCallback(async () => {
    try {
      const query = `mutation($user:ID!,$article:ID!){deleteArticle(article:$article,user:$user){ _id }}`
      const variables = { user: userId, article: _id }
      await runQuery({ query, variables })
      setNeedReload()
    } catch (err) {
      alert(err)
    }
  }, [])

  return (
    <Button className={styles.delete} onDoubleClick={deleteArticle}>
      Delete
    </Button>
  )
}
