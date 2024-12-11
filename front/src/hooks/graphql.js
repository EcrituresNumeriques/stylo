import useSWR, { preload } from 'swr'
import { shallowEqual, useSelector } from 'react-redux'
import { print } from 'graphql/language/printer'

async function fetcher({ query, variables, sessionToken, graphqlEndpoint }) {
  return request({ query, variables, sessionToken, graphqlEndpoint })
}

async function request({
  query,
  variables,
  sessionToken,
  graphqlEndpoint,
  type = 'fetch',
}) {
  const errorMessage =
    type === 'fetch'
      ? 'Something wrong happened while fetching data.'
      : 'Something wrong happened while mutating data.'
  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // Authorization header is provided only when we have a token
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })

  if (response.ok) {
    const body = await response.json()
    if (body.errors) {
      const error = new Error(errorMessage)
      error.messages = body.errors
      throw error
    }
    return body.data
  }

  const error = new Error(errorMessage)
  error.info = await response.json().errors
  error.status = response.status
  throw error
}

/**
 * @param queryOrAST GraphQL query
 * @param variables query arguments
 * @param {SWRConfiguration} [options] - optional SWR options
 * @returns {SWRResponse}
 */
export default function useGraphQL({ query: queryOrAST, variables }, options) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const graphqlEndpoint = useSelector(
    (state) => state.applicationConfig.graphqlEndpoint,
    shallowEqual
  )
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)

  return useSWR(
    { query, variables, sessionToken, graphqlEndpoint },
    fetcher,
    options
  )
}

export function useMutation() {
  const sessionToken = useSelector((state) => state.sessionToken)
  const graphqlEndpoint = useSelector(
    (state) => state.applicationConfig.graphqlEndpoint,
    shallowEqual
  )

  return runMutation.bind(null, { sessionToken, graphqlEndpoint })
}

export function runMutation(
  { sessionToken, graphqlEndpoint },
  { query: queryOrAST, variables }
) {
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)

  return request({
    query,
    variables,
    sessionToken,
    graphqlEndpoint,
    type: 'mutation',
  })
}

export function useMutate({ query: queryOrAST, variables }) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const graphqlEndpoint = useSelector(
    (state) => state.applicationConfig.graphqlEndpoint,
    shallowEqual
  )
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)

  return useSWR({ query, variables, sessionToken, graphqlEndpoint })
}

export function useSWRKey() {
  const sessionToken = useSelector((state) => state.sessionToken)
  const graphqlEndpoint = useSelector(
    (state) => state.applicationConfig.graphqlEndpoint,
    shallowEqual
  )

  return ({ query: queryOrAST, variables }) => {
    const query =
      typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)
    return { query, variables, sessionToken, graphqlEndpoint }
  }
}

export function usePreload() {
  const sessionToken = useSelector((state) => state.sessionToken)
  const graphqlEndpoint = useSelector(
    (state) => state.applicationConfig.graphqlEndpoint,
    shallowEqual
  )

  return ({ query: queryOrAST, variables }) => {
    const query =
      typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)
    return preload({ query, variables, sessionToken, graphqlEndpoint }, fetcher)
  }
}
