import { useSelector } from 'react-redux'

import { executeQuery } from '../helpers/graphQL.js'
import {
  createCorpus as createCorpusQuery,
  deleteCorpus as deleteCorpusQuery,
  getCorpora as getCorporaQuery,
  getCorpusArticles as getCorpusArticlesQuery,
  updateCorpus as updateCorpusQuery,
} from './Corpus.graphql'
import useGraphQL, { useMutateData } from './graphql.js'
import { useActiveWorkspaceId } from './workspace.js'

export function useCorpusActions() {
  const workspaceId = useActiveWorkspaceId() ?? null

  const { mutate } = useMutateData({
    query: getCorporaQuery,
    variables: {
      isPersonalWorkspace: !workspaceId,
      filter: {
        workspaceId,
      },
      workspaceId,
    },
  })

  const sessionToken = useSelector((state) => state.sessionToken)
  const createCorpus = async ({ name, description, type }) => {
    const response = await executeQuery({
      sessionToken,
      query: createCorpusQuery,
      variables: {
        createCorpusInput: {
          name,
          description,
          type,
          workspace: workspaceId,
          metadata: {},
        },
      },
    })
    await mutate(async (data) => ({
      ...data,
      // the server sorts corpus by most recently updated first
      corpora: [response.createCorpus, ...(data?.corpora ?? [])],
    }))
  }
  const deleteCorpus = async (corpusId) => {
    await executeQuery({
      sessionToken,
      query: deleteCorpusQuery,
      variables: {
        corpusId,
      },
    })
    await mutate(async (data) => ({
      ...data,
      corpora: data.corpora.filter((c) => c._id !== corpusId),
    }))
  }
  const updateCorpus = async ({ corpusId, name, description, metadata }) => {
    await executeQuery({
      sessionToken,
      query: updateCorpusQuery,
      variables: {
        corpusId,
        updateCorpusInput: {
          name,
          description,
          metadata,
        },
      },
    })
    await mutate(async (data) => ({
      ...data,
      corpora: data.corpora.map((c) => {
        if (c._id === corpusId) {
          return {
            ...c,
            ...(name && { name }),
            ...(description && { description }),
            ...(metadata !== undefined && { metadata }),
            updatedAt: new Date(),
          }
        } else {
          return c
        }
      }),
    }))
  }

  return {
    createCorpus,
    deleteCorpus,
    updateCorpus,
  }
}

export function useCorpus({ workspaceId = null }) {
  const { data, error, isLoading } = useGraphQL(
    {
      query: getCorporaQuery,
      variables: {
        isPersonalWorkspace: !workspaceId,
        filter: {
          workspaceId,
        },
        workspaceId,
      },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      fallbackData: {
        corpora: [],
        workspace: {},
      },
    }
  )

  return {
    error,
    isLoading,
    corpus: data.corpora,
    workspace: data.workspace ?? {},
  }
}

export function useCorpusArticles({ corpusId }) {
  const { data, error, isLoading } = useGraphQL(
    {
      query: getCorpusArticlesQuery,
      variables: { corpusId },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      fallbackData: {
        corpus: null,
      },
    }
  )

  return {
    error,
    isLoading,
    corpus: data.corpus,
  }
}
