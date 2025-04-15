import { useSelector } from 'react-redux'
import {
  addTags,
  deleteArticle,
  duplicateArticle,
  getArticleTags,
  removeTags,
  renameArticle,
} from '../components/Article.graphql'
import {
  getArticleVersion,
  getArticleVersions,
  getArticleWorkingCopy,
  getEditableArticle,
  renameVersion,
} from '../components/Write/Write.graphql'
import { toEntries } from '../helpers/bibtex.js'
import { executeQuery } from '../helpers/graphQL.js'
import { createVersion, updateWorkingVersion } from './ArticleService.graphql'

import useFetchData, {
  useConditionalFetchData,
  useMutateData,
} from './graphql.js'

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

export function useEditableArticle({ articleId, versionId }) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const activeUser = useSelector((state) => state.activeUser)
  const hasVersion = typeof versionId === 'string'
  const { data, mutate, error, isLoading } = useFetchData(
    {
      query: getEditableArticle,
      variables: {
        article: articleId,
        hasVersion,
        version: versionId ?? '',
      },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const updateBibliography = async (bib) => {
    await executeQuery({
      sessionToken,
      query: updateWorkingVersion,
      variables: {
        userId: activeUser._id,
        articleId: articleId,
        content: { bib },
      },
      type: 'mutate',
    })
    await mutate(
      async (data) => {
        if (hasVersion) {
          return {
            article: {
              ...data,
              version: {
                ...data.version,
                bib: bib,
              },
            },
          }
        } else {
          return {
            article: {
              ...data,
              workingVersion: {
                ...data.workingVersion,
                bib: bib,
              },
            },
          }
        }
      },
      { revalidate: false }
    )
  }

  const bibtext = hasVersion
    ? (data?.article?.version?.bib ?? '')
    : (data?.article?.workingVersion?.bib ?? '')

  const entries = toEntries(bibtext)

  return {
    article: data?.article,
    updateBibliography,
    bibliography: {
      bibtext,
      entries,
    },
    isLoading,
    error,
  }
}

export function useBibliographyActions({ articleId }) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const activeUser = useSelector((state) => state.activeUser)
  const { mutate } = useMutateData({
    query: getEditableArticle,
    variables: {
      article: articleId,
      hasVersion: false,
      version: '',
    },
  })

  const updateBibliography = async (bib) => {
    await executeQuery({
      sessionToken,
      query: updateWorkingVersion,
      variables: {
        userId: activeUser._id,
        articleId: articleId,
        content: { bib },
      },
      type: 'mutate',
    })
    await mutate(
      async (data) => {
        return {
          article: {
            ...data,
            workingVersion: {
              ...data.workingVersion,
              bib: bib,
            },
          },
        }
      },
      { revalidate: false }
    )
  }

  return {
    updateBibliography,
  }
}

export function useArticleVersions({ articleId }) {
  const { data, error, isLoading } = useFetchData(
    { query: getArticleVersions, variables: { article: articleId } },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    error,
    isLoading,
    article: data?.article,
  }
}

export function useArticleVersion({ versionId }) {
  const { data, error, isLoading } = useConditionalFetchData(
    versionId ? { query: getArticleVersion, variables: { versionId } } : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    error,
    isLoading,
    version: data?.version,
  }
}

export function useArticleVersionActions({ articleId }) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const activeUser = useSelector((state) => state.activeUser)
  const { mutate } = useMutateData({
    query: getArticleVersions,
    variables: { article: articleId },
  })
  const create = async (version) => {
    const response = await executeQuery({
      query: createVersion,
      variables: {
        userId: activeUser._id,
        articleId,
        major: version.major,
        message: version.description,
      },
      sessionToken,
      type: 'mutation',
    })
    await mutate(async (data) => ({
      article: {
        ...data?.article,
        versions: response.article.createVersion.versions,
      },
    }))
  }
  const updateDescription = async ({ versionId, description }) => {
    await executeQuery({
      query: renameVersion,
      variables: {
        version: versionId,
        name: description,
      },
      sessionToken,
      type: 'mutation',
    })
    await mutate(async (data) => ({
      article: {
        ...data?.article,
        versions: data.article.versions.map((v) => {
          if (v._id === versionId) {
            return {
              ...v,
              message: description,
            }
          }
          return v
        }),
      },
    }))
  }

  return {
    create,
    updateDescription,
  }
}
