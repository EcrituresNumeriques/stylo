import React, { useCallback } from 'react'
import { useGraphQL } from '../helpers/graphQL'

import ArticleTag from './Tag'

import { addTags, removeTags } from './Articles.graphql'
import { useCurrentUser } from '../contexts/CurrentUser'

export default function ArticleTags ({ articleId, onChange, tags, userTags }) {

  const runQuery = useGraphQL()
  const activeUser = useCurrentUser()

  const selectedTags = tags.map(({ _id }) => _id)

  const handleClick = useCallback(async (event) => {
    const [id, checked] = [event.target.value, event.target.checked]
    const variables = { article: articleId, tags: [id], user: activeUser._id }

    const [query, updatedSelectedTags] = checked
      ? [addTags, [...selectedTags, id]]
      : [removeTags, selectedTags.filter(v => v !== id)]

    await runQuery({ query, variables })
    const allTags = [].concat(tags, userTags)

    // Bubble up article Tag objects replacements
    onChange(updatedSelectedTags.map(id => allTags.find(({ _id }) => _id === id)))
  }, [selectedTags])

  return (
    <ul>
      {userTags.map((tag) => (
        <li key={`article-${articleId}-${tag._id}`}>
          <ArticleTag tag={tag} selected={selectedTags.includes(tag._id)} onClick={handleClick} />
        </li>
      ))}
    </ul>
  )
}
