import React, { useCallback } from 'react'

import useFetchData from '../../hooks/graphql.js'
import { useWorkspaces } from '../../hooks/workspace.js'

import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'
import WorkspaceSelectItem from './WorkspaceSelectItem.jsx'

import { getArticleWorkspaces } from '../../hooks/Workspaces.graphql'

/**
 * @param {object} props
 * @param {string} props.articleId
 * @returns {Element}
 */
export default function WorkspaceSelectionItems({ articleId }) {
  const {
    workspaces,
    isLoading: isLoadingWorkspaces,
    error: errorLoadingWorkspace,
  } = useWorkspaces()
  const {
    data,
    isLoading: isLoadingArticleWorkspaces,
    error: errorLoadingArticleWorkspaces,
    mutate,
  } = useFetchData(
    { query: getArticleWorkspaces, variables: { articleId } },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const articleWorkspaces = data?.article?.workspaces || []
  const handleWorkspaceUpdate = useCallback(() => {
    mutate()
  }, [mutate])

  if (isLoadingWorkspaces || isLoadingArticleWorkspaces) {
    return <Loading />
  }

  if (errorLoadingWorkspace) {
    return <Alert message={errorLoadingWorkspace.message} />
  }

  if (errorLoadingArticleWorkspaces) {
    return <Alert message={errorLoadingArticleWorkspaces.message} />
  }

  return (
    <>
      {workspaces.map((workspace) => (
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
