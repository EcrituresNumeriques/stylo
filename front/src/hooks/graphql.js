import useSWR from 'swr'
import { useSelector } from 'react-redux'

async function fetcher ({ query, variables, sessionToken, graphqlEndpoint }) {
  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // Authorization header is provided only when we have a token
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
    },
    body: JSON.stringify({ query, variables })
  })

  if (response.ok) {
    const { data } = await response.json()
    return data
  }

  const error = new Error('Something wrong happened data fetching.')
  error.info = await response.json().errors
  error.status = response.status
  throw error
}

export default function useGraphQL ({ query: queryOrAST, variables }) {
  const sessionToken = useSelector(state => state.sessionToken)
  const graphqlEndpoint = useSelector(state => state.applicationConfig.graphqlEndpoint)
  const query = 'loc' in queryOrAST ? queryOrAST.loc.source.body : queryOrAST

  return useSWR({ query, variables, sessionToken, graphqlEndpoint }, fetcher, {
    fallbackData: {
      data: {},
      errors: [],
    }
  })
}
