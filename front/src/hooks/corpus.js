import { useSelector } from 'react-redux'

import { executeQuery } from '../helpers/graphQL.js'
import {
  createCorpus as createCorpusQuery,
  deleteCorpus as deleteCorpusQuery,
  getCorpusArticles as getCorpusArticlesQuery,
  getCorpuses as getCorpusesQuery,
  updateCorpus as updateCorpusQuery,
} from './Corpus.graphql'
import useGraphQL, { useMutateData } from './graphql.js'
import { useActiveWorkspaceId } from './workspace.js'

export function useCorpusActions() {
  const workspaceId = useActiveWorkspaceId() ?? null

  const { mutate } = useMutateData({
    query: getCorpusesQuery,
    variables: {
      isPersonalWorkspace: !workspaceId,
      filter: {
        workspaceId,
      },
      workspaceId,
    },
  })

  const sessionToken = useSelector((state) => state.sessionToken)
  const createCorpus = async ({ title, description, type }) => {
    const response = await executeQuery({
      sessionToken,
      query: createCorpusQuery,
      variables: {
        createCorpusInput: {
          name: title,
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
      corpuses: [response.createCorpus, ...(data?.corpuses ?? [])],
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
      corpuses: data.corpuses.filter((c) => c._id !== corpusId),
    }))
  }
  const updateCorpus = async ({ corpusId, title, description, metadata }) => {
    await executeQuery({
      sessionToken,
      query: updateCorpusQuery,
      variables: {
        corpusId,
        updateCorpusInput: {
          name: title,
          description,
          metadata,
        },
      },
    })
    await mutate(async (data) => ({
      ...data,
      corpuses: data.corpuses.map((c) => {
        if (c._id === corpusId) {
          return {
            ...c,
            ...(title && { name: title }),
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
      query: getCorpusesQuery,
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
        corpuses: [],
        workspace: {},
      },
    }
  )

  return {
    error,
    isLoading,
    corpus: data.corpuses,
    workspace: data.workspace ?? {},
  }
}

export function useCorpusArticles({ corpusId }) {
  const { data, error, isLoading } = useGraphQL(
    {
      query: getCorpusArticlesQuery,
      variables: {
        filter: {
          corpusId,
        },
      },
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      fallbackData: {
        corpus: [],
      },
    }
  )

  return {
    error,
    isLoading,
    corpus: data.corpus,
  }
}
