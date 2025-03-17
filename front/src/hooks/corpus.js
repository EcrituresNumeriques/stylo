import { useSelector } from 'react-redux'
import {
  createCorpus as createCorpusQuery,
  deleteCorpus as deleteCorpusQuery,
  getCorpus as getCorpusQuery,
  updateCorpus as updateCorpusQuery,
} from '../components/corpus/Corpus.graphql'
import { executeQuery } from '../helpers/graphQL.js'
import useGraphQL, { useMutateData } from './graphql.js'
import { useActiveWorkspace } from './workspace.js'

export function useCorpusActions() {
  const activeWorkspace = useActiveWorkspace()
  const workspaceId = activeWorkspace?._id
  const variables = workspaceId ? { filter: { workspaceId } } : {}
  const { mutate } = useMutateData({ query: getCorpusQuery, variables })
  const sessionToken = useSelector((state) => state.sessionToken)
  const createCorpus = async ({ title, description }) => {
    const response = await executeQuery({
      sessionToken,
      query: createCorpusQuery,
      variables: {
        createCorpusInput: {
          name: title,
          description,
          workspace: activeWorkspace?._id,
          metadata: '',
        },
      },
    })
    await mutate(async (data) => ({
      article: [...data.corpus, response.createCorpus],
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
      corpus: data.corpus.filter((c) => c._id !== corpusId),
    }))
  }
  const updateCorpus = async ({ corpusId, title, description }) => {
    await executeQuery({
      sessionToken,
      query: updateCorpusQuery,
      variables: {
        corpusId,
        updateCorpusInput: {
          name: title,
          description,
        },
      },
    })
    await mutate(async (data) => ({
      article: data.corpus.map((c) => {
        if (c._id === corpusId) {
          return {
            ...c,
            title,
            description,
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

export function useCorpus() {
  const activeWorkspace = useActiveWorkspace()
  const workspaceId = activeWorkspace?._id
  const variables = workspaceId ? { filter: { workspaceId } } : {}
  const { data, error, isLoading } = useGraphQL(
    { query: getCorpusQuery, variables },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  return {
    error,
    isLoading,
    corpus: data?.corpus ?? [],
  }
}
