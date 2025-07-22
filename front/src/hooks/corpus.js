import { executeQuery } from '../helpers/graphQL.js'
import useGraphQL, { useMutateData } from './graphql.js'
import { useActiveWorkspaceId } from './workspace.js'

import {
  createCorpus as createCorpusQuery,
  deleteCorpus as deleteCorpusQuery,
  getCorpus as getCorpusQuery,
  updateCorpus as updateCorpusQuery,
} from '../components/corpus/Corpus.graphql'

export function useCorpusActions() {
  const workspaceId = useActiveWorkspaceId()

  const { mutate } = useMutateData({
    query: getCorpusQuery,
    variables: {
      isPersonalWorkspace: !workspaceId,
      filter: {
        workspaceId,
      },
      workspaceId,
    },
  })

  const createCorpus = async ({ title, description, type }) => {
    const response = await executeQuery({
      query: createCorpusQuery,
      variables: {
        createCorpusInput: {
          name: title,
          description,
          type,
          workspace: workspaceId,
          metadata: '',
        },
      },
    })
    await mutate(async (data) => ({
      corpus: [...(data?.corpus ?? []), response.createCorpus],
    }))
  }
  const deleteCorpus = async (corpusId) => {
    await executeQuery({
      query: deleteCorpusQuery,
      variables: {
        corpusId,
      },
    })
    await mutate(async (data) => ({
      corpus: data.corpus.filter((c) => c._id !== corpusId),
    }))
  }
  const updateCorpus = async ({ corpusId, title, description, metadata }) => {
    await executeQuery({
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
      corpus: data.corpus.map((c) => {
        if (c._id === corpusId) {
          return {
            ...c,
            ...(title && { title }),
            ...(description && { description }),
            ...(metadata && { metadata }),
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

export function useCorpus({ workspaceId }) {
  const { data, error, isLoading } = useGraphQL(
    {
      query: getCorpusQuery,
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
        corpus: [],
        workspace: {},
      },
    }
  )

  return {
    error,
    isLoading,
    corpus: data.corpus,
    workspace: data.workspace ?? {},
  }
}
