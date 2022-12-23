import React, { useCallback } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { useGraphQL } from '../helpers/graphQL'

import ArticleTag from './Tag'

import { addTags } from './Articles.graphql'

export default function ArticleTags ({ article, currentUser, masterTags, stateTags, setTags }) {
  const runQuery = useGraphQL()
  const articleId = article._id
  const isArticleOwner = currentUser._id === article.owner._id
  const activeUser = useSelector(state => state.activeUser, shallowEqual)

  const addToTags = useCallback(async (tag) => {
    setTags([...stateTags, { ...tag, selected: true }])
    const variables = {
      article: articleId,
      tags: [tag._id],
      user: currentUser._id,
    }
    await runQuery({ query: addTags, variables })
  }, [stateTags])

  const rmFromTags = async (id) => {
    setTags(stateTags.filter((t) => t._id !== id))
    try {
      const query = `mutation($article:ID!,$tag:ID!,$user:ID!){removeFromTag(article:$article,tag:$tag,user:$user){ _id }}`
      const variables = {
        article: articleId,
        tag: id,
        user: currentUser._id,
      }
      await runQuery({ query, variables })
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
