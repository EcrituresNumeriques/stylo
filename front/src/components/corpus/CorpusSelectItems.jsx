import PropTypes from 'prop-types'
import { Loading } from '@geist-ui/core'
import React, { useCallback, useMemo } from 'react'
import useGraphQL from '../../hooks/graphql.js'
import { useActiveWorkspace } from '../../hooks/workspace.js'
import { getWorkspaceCorpus, getUserCorpus } from './Corpus.graphql'
import CorpusSelectItem from './CorpusSelectItem.jsx'

export default function CorpusSelectItems ({ articleId }) {
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = useMemo(() => activeWorkspace?._id, [activeWorkspace])

  const query = useMemo(() => activeWorkspaceId ? getWorkspaceCorpus : getUserCorpus, [activeWorkspaceId])
  const variables = useMemo(() => activeWorkspaceId ? { workspaceId: activeWorkspaceId } : {}, [activeWorkspaceId])

  const { data, isLoading, mutate } = useGraphQL({ query, variables }, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })

  const handleCorpusUpdate = useCallback(() => {
    mutate()
  }, [mutate])

  const corpuses = useMemo(() => ((activeWorkspaceId ? data?.workspace?.corpus : data?.corpus) || []).sort((a, b) => a.name.localeCompare(b.name)), [activeWorkspaceId, data])

  if (isLoading) {
    return <Loading/>
  }

  return (<>
      {corpuses.map((c) => <CorpusSelectItem
        key={c._id}
        id={c._id}
        name={c.name}
        articleId={articleId}
        selected={c.articles.map((a) => a.article._id).includes(articleId)}
        onChange={handleCorpusUpdate}
      />)}
    </>
  )
}

CorpusSelectItems.propTypes = {
  articleId: PropTypes.string
}
