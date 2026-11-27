import { useConditionalFetchData } from './graphql.js'
import { search as searchQuery } from './Search.graphql'

const MAX_RESULTS = 20

/**
 * Articles and corpora matching a query, mixed and most relevant first
 * (nothing is fetched while the query is empty).
 *
 * @param {string} query
 */
export function useSearch(query) {
  const { data, error, isLoading } = useConditionalFetchData(
    query ? { query: searchQuery, variables: { query } } : null,
    { revalidateOnFocus: false }
  )
  const { articles = [], corpora = [], total = 0 } = data?.search ?? {}
  const results = [...articles, ...corpora]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
  return { results, total, error, isLoading }
}
