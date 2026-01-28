import React, { useCallback, useMemo } from 'react'

import useFetchData from '../../hooks/graphql.js'
import { useActiveWorkspaceId } from '../../hooks/workspace.js'
import { Loading } from '../molecules/index.js'

import CorpusSelectItem from './CorpusSelectItem.jsx'

import { getCorpus } from '../../hooks/Corpus.graphql'

/**
 * @param props
 * @param {string} props.articleId
 * @return {Element}
 */
export default function CorpusSelectItems({ articleId }) {
  const activeWorkspaceId = useActiveWorkspaceId()
  const variables = useMemo(
    () => ({
      includeArticles: true,
      ...(activeWorkspaceId && { filter: { workspaceId: activeWorkspaceId } }),
    }),
    [activeWorkspaceId]
  )

  const { data, isLoading, mutate } = useFetchData(
    { query: getCorpus, variables },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const handleCorpusUpdate = useCallback(() => {
    mutate()
  }, [mutate])

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      {data &&
        data.corpus
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((c) => (
            <CorpusSelectItem
              key={c._id}
              id={c._id}
              name={c.name}
              articleId={articleId}
              selected={c.articles
                .map((a) => a?.article?._id)
                .includes(articleId)}
              onChange={handleCorpusUpdate}
            />
          ))}
    </>
  )
}
