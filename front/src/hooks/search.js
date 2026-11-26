import { useConditionalFetchData } from './graphql.js'
import { search as searchQuery } from './Search.graphql'

/**
 * Articles and corpora matching a query (nothing is fetched while it is empty).
 *
 * @param {string} query
 */
export function useSearch(query) {
  const { data, error, isLoading } = useConditionalFetchData(
    query ? { query: searchQuery, variables: { query } } : null,
    { revalidateOnFocus: false }
  )
  return {
    articles: data?.search.articles ?? [],
    corpora: data?.search.corpora ?? [],
    error,
    isLoading,
  }
}
