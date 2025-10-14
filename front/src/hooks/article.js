import { merge } from 'allof-merge'
import { useSelector } from 'react-redux'

import { toYaml } from '../components/Write/metadata/yaml.js'
import { toEntries } from '../helpers/bibtex.js'
import { executeQuery } from '../helpers/graphQL.js'
import { clean } from '../schemas/schemas.js'
import useFetchData, {
  useConditionalFetchData,
  useMutateData,
} from './graphql.js'

import {
  addTags,
  deleteArticle,
  duplicateArticle,
  getArticleMetadata,
  getArticleTags,
  getEditableArticle,
  removeTags,
  renameArticle,
  updateWorkingVersion,
  updateZoteroLinkMutation,
} from '../components/Article.graphql'
import {
  createVersion,
  getArticleVersion,
  getArticleVersions,
  renameVersion,
} from './Versions.graphql'

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
      sessionToken,
      type: 'mutation',
    })
  }

  return {
    copy,
    duplicate,
    rename,
    remove,
  }
}

export function useArticleMetadata({ articleId, versionId }) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const activeUser = useSelector((state) => state.activeUser)
  const hasVersion = typeof versionId === 'string'
  const { data, error, mutate, isLoading } = useFetchData(
    {
      query: getArticleMetadata,
      variables: { articleId, versionId: versionId ?? '', hasVersion },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const updateMetadataFormType = async (metadataFormType) => {
    if (versionId) {
      return
    }
    await executeQuery({
      sessionToken,
      query: updateWorkingVersion,
      variables: {
        userId: activeUser._id,
        articleId: articleId,
        content: { metadataFormType },
      },
      type: 'mutate',
    })
    await mutate(
      async (data) => {
        return {
          article: {
            ...data.article,
            workingVersion: {
              ...data.article.workingVersion,
              metadataFormType: metadataFormType,
            },
          },
        }
      },
      { revalidate: false }
    )
  }

  const updateMetadata = async (metadata) => {
    if (versionId) {
      return
    }
    await executeQuery({
      sessionToken,
      query: updateWorkingVersion,
      variables: {
        userId: activeUser._id,
        articleId: articleId,
        content: { metadata },
      },
      type: 'mutate',
    })
    await mutate(
      async (data) => {
        return {
          article: {
            ...data.article,
            workingVersion: {
              ...data.article.workingVersion,
              metadata: metadata,
            },
          },
        }
      },
      { revalidate: false }
    )
  }

  const metadata = hasVersion
    ? data?.version?.metadata
    : data?.article?.workingVersion?.metadata

  const options = data?.article?.workspaces
    ?.filter((w) => w.formMetadata.data !== null)
    .map((w) => {
      try {
        const data = merge(JSON.parse(w.formMetadata.data))
        const ui =
          w.formMetadata.ui !== null ? JSON.parse(w.formMetadata.ui) : {}
        return {
          name: data.title || 'untitled',
          data,
          ui,
        }
      } catch (e) {
        console.error(
          `Ignore form metadata configured on workspace id: ${w._id}`,
          e
        )
        return null
      }
    })
    ?.filter((o) => o !== null)

  const metadataFormType = hasVersion
    ? data?.version?.metadataFormType
    : data?.article?.workingVersion?.metadataFormType

  return {
    metadata,
    metadataFormType,
    metadataFormTypeOptions: options ?? [],
    metadataYaml: metadata ? toYaml(clean(metadata)) : '',
    updateMetadata,
    updateMetadataFormType,
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
      fallbackData: {
        article: {},
      },
    }
  )

  const updateBibliography = async (bib) => {
    if (hasVersion) {
      // can only update the bibliography on the working copy
      return
    }
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
            ...data.article,
            workingVersion: {
              ...data.article.workingVersion,
              bib,
            },
          },
        }
      },
      { revalidate: false }
    )
  }

  const updateZoteroLink = async (url) => {
    await executeQuery({
      sessionToken,
      query: updateZoteroLinkMutation,
      variables: {
        articleId: articleId,
        url,
      },
      type: 'mutate',
    })
    await mutate(
      async (data) => {
        return {
          article: {
            ...data.article,
            zoteroLink: url,
          },
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
    updateZoteroLink,
    bibliography: {
      bibtext,
      entries,
    },
    isLoading,
    error,
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
      fallbackData: {
        version: {},
      },
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
