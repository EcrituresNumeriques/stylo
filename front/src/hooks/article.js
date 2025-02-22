import { useSelector } from 'react-redux'
import { executeQuery } from '../helpers/graphQL.js'
import {
  duplicateArticle,
  renameArticle,
  deleteArticle,
} from '../components/Article.graphql'

import {
  addTags,
  removeTags,
  getArticleTags,
} from '../components/Article.graphql'
import useFetchData from './graphql.js'

export function useArticleTagActions({ articleId }) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const { data, mutate, error, isLoading } = useFetchData(
    { query: getArticleTags, variables: { articleId } },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const add = async (tagId) => {
    const result = await executeQuery({
      query: addTags,
      variables: {
        articleId,
        tags: [tagId],
      },
      sessionToken,
      type: 'mutation',
    })
    const tags = result.article.addTags
    mutate(
      {
        article: {
          tags,
        },
      },
      { revalidate: false }
    )
  }
  const remove = async (tagId) => {
    const result = await executeQuery({
      query: removeTags,
      variables: {
        articleId,
        tags: [tagId],
      },
      sessionToken,
      type: 'mutation',
    })
    const tags = result.article.removeTags
    mutate(
      {
        article: {
          tags,
        },
      },
      { revalidate: false }
    )
  }

  return {
    tags: data?.article?.tags || [],
    isLoading,
    error,
    add,
    remove,
  }
}

export function useArticleActions({ articleId }) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const activeUser = useSelector((state) => state.activeUser)
  const copy = async (toUserId) => {
    return await executeQuery({
      query: duplicateArticle,
      variables: {
        user: null,
        to: toUserId,
        article: articleId,
      },
      sessionToken,
      type: 'mutation',
    })
  }
  const duplicate = async () => {
    return await executeQuery({
      query: duplicateArticle,
      variables: {
        user: activeUser._id,
        to: activeUser._id,
        article: articleId,
      },
      sessionToken,
      type: 'mutation',
    })
  }
  const rename = async (title) => {
    return await executeQuery({
      query: renameArticle,
      variables: { user: activeUser._id, articleId, title },
      sessionToken,
      type: 'mutation',
    })
  }
  const remove = async () => {
    return await executeQuery({
      query: deleteArticle,
      variables: { articleId },
    })
  }

  return {
    copy,
    duplicate,
    rename,
    remove,
  }
}
