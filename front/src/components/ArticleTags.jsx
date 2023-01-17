import React, { useCallback } from 'react'
import { useGraphQL } from '../helpers/graphQL'

import ArticleTag from './Tag'

import { addTags, removeTags } from './Articles.graphql'
import { useCurrentUser } from '../contexts/CurrentUser'

export default function ArticleTags ({ article, masterTags, stateTags, setTags }) {
  const runQuery = useGraphQL()
  const articleId = article._id
  const activeUser = useCurrentUser()
  const isArticleOwner = activeUser._id === article.owner._id

  const addToTags = useCallback(async (tag) => {
    setTags([...stateTags, { ...tag, selected: true }])
    const variables = {
      article: articleId,
      tags: [tag._id],
      user: activeUser._id,
    }
    await runQuery({ query: addTags, variables })
  }, [stateTags])

  const rmFromTags = useCallback(async (id) => {
    setTags(stateTags.filter((t) => t._id !== id))
    const variables = {
      article: articleId,
      tags: [id],
      user: activeUser._id,
    }
    await runQuery({ query: removeTags, variables })
  }, [stateTags])

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
