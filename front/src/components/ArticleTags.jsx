import { Loading } from '@geist-ui/core'
import React, { useCallback } from 'react'
import useGraphQL, { useMutation } from '../hooks/graphql'

import ArticleTag from './Tag'

import { addTags, removeTags, getArticleTags } from './Article.graphql'

export default function ArticleTags({
  articleId,
  userTags,
  onArticleTagsUpdated,
}) {
  const { data, isLoading, mutate } = useGraphQL(
    { query: getArticleTags, variables: { articleId } },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const mutation = useMutation()

  const articleTags = data?.article?.tags || []
  const articleTagIds = articleTags.map(({ _id }) => _id)

  const handleClick = useCallback(
    async (event) => {
      const [id, checked] = [event.target.value, event.target.checked]
      const query = checked ? addTags : removeTags
      const result = await mutation({
        query,
        variables: { article: articleId, tags: [id] },
      })
      const updatedTags = checked
        ? result.article.addTags
        : result.article.removeTags
      mutate(
        {
          article: {
            tags: updatedTags,
          },
        },
        { revalidate: false }
      )
      onArticleTagsUpdated({ articleId, updatedTags })
    },
    [articleId]
  )

  if (isLoading) {
    return <Loading />
  }

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
