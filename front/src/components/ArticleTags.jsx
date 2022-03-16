import React from 'react'
import { connect } from 'react-redux'

import askGraphQL from '../helpers/graphQL'

import Tag from './Tag'

const mapStateToProps = ({ sessionToken, applicationConfig }) => {
  return { sessionToken, applicationConfig }
}

const ConnectedArticleTags = ({ article, currentUser, masterTags, stateTags, setTags, sessionToken, applicationConfig }) => {
  const articleId = article._id
  const isArticleOwner = currentUser._id === article.owner._id

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
          <Tag tag={tag}
               activeUser={currentUser}
               name={`articleTag-${tag._id}`}
               onClick={() => rmFromTags(tag._id)}
          />
        </li>
      ))}

      {isArticleOwner && masterTags
        .filter((t) => !stateTags.map((u) => u._id).includes(t._id))
        .map((tag) => (
          <li
            key={`article-${articleId}-${tag._id}`}
          >
            <Tag tag={tag}
                 activeUser={currentUser}
                 name={`articleTag-${tag._id}`}
                 onClick={() => addToTags(tag)}
            />
          </li>
        ))}
    </ul>
  )
}

const ArticleTags = connect(mapStateToProps)(ConnectedArticleTags)
export default ArticleTags
