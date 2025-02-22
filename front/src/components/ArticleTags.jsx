import { Loading } from '@geist-ui/core'
import React, { useCallback } from 'react'

import ArticleTag from './Tag'

import { useArticleTagActions } from '../hooks/article.js'

export default function ArticleTags({
  articleId,
  userTags,
  onArticleTagsUpdated,
}) {
  const { tags, isLoading, error, remove, add } = useArticleTagActions({
    articleId,
  })

  const handleClick = useCallback(
    async (event) => {
      const [id, checked] = [event.target.value, event.target.checked]
      if (checked) {
        await add(id)
      } else {
        await remove(id)
      }
      onArticleTagsUpdated({ articleId, updatedTags })
    },
    [articleId]
  )

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const articleTagIds = tags.map(({ _id }) => _id)
  return (
    <ul>
      {userTags.map((tag) => (
        <li key={`article-${articleId}-${tag._id}`}>
          <ArticleTag
            tag={tag}
            selected={articleTagIds.includes(tag._id)}
            onClick={handleClick}
          />
        </li>
      ))}
    </ul>
  )
}
