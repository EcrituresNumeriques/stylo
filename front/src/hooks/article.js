import { useSelector } from 'react-redux'
import {
  addTags,
  deleteArticle,
  duplicateArticle,
  getArticleTags,
  removeTags,
  renameArticle,
} from '../components/Article.graphql'
import { getArticleWorkingCopy } from '../components/Write/Write.graphql'
import { executeQuery } from '../helpers/graphQL.js'
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
    return tags
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
    return tags
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
        articleId,
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
        articleId,
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

export function useArticleWorkingCopy({ articleId }) {
  const { data, error, isLoading } = useFetchData(
    { query: getArticleWorkingCopy, variables: { articleId } },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    article: data?.article,
    isLoading,
    error,
  }
}
