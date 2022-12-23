import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'

import Button from './Button'
import { deleteArticle as query } from './Articles.graphql'

import styles from './articles.module.scss'
import { useGraphQL } from '../helpers/graphQL'

export default function ArticleDelete ({ setNeedReload, article }) {
  const runQuery = useGraphQL()
  const userId = useSelector(state => state.activeUser._id)
  const { _id } = article

  const deleteArticle = useCallback(async () => {
    try {
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
