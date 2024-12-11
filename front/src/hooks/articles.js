import { useCallback, useMemo } from 'react'
import useGraphQL from './graphql.js'
import { useActiveUserId } from './user.js'
import { useActiveWorkspace } from './workspace.js'
import {
  getUserArticles,
  getWorkspaceArticles,
} from '../components/Articles.graphql'

export function useArticles() {
  const activeUserId = useActiveUserId()
  const activeWorkspace = useActiveWorkspace()
  const activeWorkspaceId = useMemo(
    () => activeWorkspace?._id,
    [activeWorkspace]
  )
  const query = useMemo(
    () => (activeWorkspaceId ? getWorkspaceArticles : getUserArticles),
    [activeWorkspaceId]
  )
  const variables = useMemo(
    () =>
      activeWorkspaceId
        ? { workspaceId: activeWorkspaceId }
        : { user: activeUserId },
    [activeWorkspaceId]
  )
  const { data, isLoading, mutate } = useGraphQL(
    { query, variables },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const articles = useMemo(
    () =>
      (activeWorkspaceId ? data?.workspace?.articles : data?.articles) || [],
    [activeWorkspaceId, data]
  )
  const workspace = useMemo(() => data?.workspace, [data])

  const mutateData = async (updatedArticles) => {
    const data = activeWorkspaceId
      ? {
          workspace: {
            ...workspace,
            articles: updatedArticles,
          },
        }
      : {
          articles: updatedArticles,
        }
    await mutate(data, { revalidate: false })
  }

  const updateArticle = useCallback(
    async (updatedArticle) => {
      const updatedArticles = articles.map((article) =>
        article._id === updatedArticle._id ? updatedArticle : article
      )
      await mutateData(updatedArticles)
    },
    [articles]
  )

  const deleteArticle = useCallback(
    async (deletedArticle) => {
      const updatedArticles = articles.filter(
        (article) => article._id !== deletedArticle._id
      )
      await mutateData(updatedArticles)
    },
    [articles]
  )

  const createArticle = useCallback(
    async (createdArticle) => {
      const updatedArticles = [createdArticle, ...articles]
      await mutateData(updatedArticles)
    },
    [articles]
  )

  return { articles, isLoading, updateArticle, deleteArticle, createArticle }
}
