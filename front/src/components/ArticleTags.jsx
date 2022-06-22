import React from 'react'
import { connect, useSelector } from 'react-redux'

import askGraphQL from '../helpers/graphQL'

import ArticleTag from './Tag'

const mapStateToProps = ({ sessionToken, applicationConfig }) => {
  return { sessionToken, applicationConfig }
}

const ConnectedArticleTags = ({ article, currentUser, masterTags, stateTags, setTags, sessionToken, applicationConfig }) => {
  const articleId = article._id
  const isArticleOwner = currentUser._id === article.owner._id
  const activeUser = useSelector(state => state.activeUser)

  const addToTags = async (tag) => {
    setTags([...stateTags, { ...tag, selected: true }])

    try {
      const query = `mutation($article:ID!,$tag:ID!,$user:ID!){addToTag(article:$article,tag:$tag,user:$user){ _id }}`
      const variables = {
        article: articleId,
        tag: tag._id,
        user: currentUser._id,
      }
      await askGraphQL(
        { query, variables },
        'adding to tag',
        sessionToken,
        applicationConfig
      )
    } catch (err) {
      alert(err)
    }
  }

  const rmFromTags = async (id) => {
    setTags(stateTags.filter((t) => t._id !== id))
    try {
      const query = `mutation($article:ID!,$tag:ID!,$user:ID!){removeFromTag(article:$article,tag:$tag,user:$user){ _id }}`
      const variables = {
        article: articleId,
        tag: id,
        user: currentUser._id,
      }
      await askGraphQL(
        { query, variables },
        'removing from tag',
        sessionToken,
        applicationConfig
      )
    } catch (err) {
      alert(err)
    }
  }

  return (
    <ul>
      {stateTags.map((tag) => (
        <li key={`article-${articleId}-${tag._id}`}>
          <ArticleTag tag={tag}
               name={`articleTag-${tag._id}`}
               onClick={() => rmFromTags(tag._id)}
               disableAction={activeUser._id !== tag.owner}
          />
        </li>
      ))}

      {isArticleOwner && masterTags
        .filter((t) => !stateTags.map((u) => u._id).includes(t._id))
        .map((tag) => (
          <li
            key={`article-${articleId}-${tag._id}`}
          >
            <ArticleTag tag={tag}
                 name={`articleTag-${tag._id}`}
                 onClick={() => addToTags(tag)}
                 disableAction={activeUser._id !== tag.owner}
            />
          </li>
        ))}
    </ul>
  )
}

const ArticleTags = connect(mapStateToProps)(ConnectedArticleTags)
export default ArticleTags
