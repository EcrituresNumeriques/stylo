import React from 'react'
import { connect } from 'react-redux'

import Button from './Button'

import styles from './articles.module.scss'
import askGraphQL from '../helpers/graphQL'

const mapStateToProps = ({ sessionToken, activeUser, applicationConfig }) => {
  return { sessionToken, activeUser, applicationConfig }
}

const ConnectedArticleDelete = ({ activeUser, article, sessionToken, applicationConfig, setNeedReload }) => {
  const deleteArticle = async () => {
    try {
      const query = `mutation($user:ID!,$article:ID!){deleteArticle(article:$article,user:$user){ _id }}`
      const variables = { user: activeUser._id, article: article._id }
      await askGraphQL(
        { query, variables },
        'Deleting Article',
        sessionToken,
        applicationConfig
      )
      setNeedReload()
    } catch (err) {
      alert(err)
    }
  }

  return (
    <Button className={styles.delete} onDoubleClick={() => deleteArticle()}>
      Delete
    </Button>
  )
}

const ArticleDelete = connect(mapStateToProps)(ConnectedArticleDelete)
export default ArticleDelete
