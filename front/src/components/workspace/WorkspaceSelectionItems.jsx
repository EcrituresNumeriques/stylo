import { Loading } from '@geist-ui/core'
import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import { getArticleWorkspaces } from './Workspaces.graphql'
import useFetchData from '../../hooks/graphql.js'
import WorkspaceSelectItem from './WorkspaceSelectItem.jsx'

export default function WorkspaceSelectionItems({ articleId }) {
  const userWorkspaces = useSelector((state) => state.activeUser.workspaces)
  const { data, isLoading, mutate } = useFetchData(
    { query: getArticleWorkspaces, variables: { articleId } },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const articleWorkspaces = useMemo(
    () => data?.article?.workspaces || [],
    [data]
  )

  const handleWorkspaceUpdate = useCallback(() => {
    mutate()
  }, [mutate])

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      {userWorkspaces.map((workspace) => (
        <WorkspaceSelectItem
          key={workspace._id}
          id={workspace._id}
          color={workspace.color}
          name={workspace.name}
          articleId={articleId}
          selected={articleWorkspaces.map((w) => w._id).includes(workspace._id)}
          onChange={handleWorkspaceUpdate}
        />
      ))}
    </>
  )
}

WorkspaceSelectionItems.propTypes = {
  articleId: PropTypes.string,
}
