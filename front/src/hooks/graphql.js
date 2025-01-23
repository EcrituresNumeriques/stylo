import useSWR, { preload } from 'swr'
import { useSelector } from 'react-redux'
import { print } from 'graphql/language/printer'
import { applicationConfig } from '../config.js'

async function fetcher({ query, variables, sessionToken }) {
  return request({ query, variables, sessionToken })
}

async function request({ query, variables, sessionToken, type = 'fetch' }) {
  const errorMessage =
    type === 'fetch'
      ? 'Something wrong happened while fetching data.'
      : 'Something wrong happened while mutating data.'
  const response = await fetch(applicationConfig.graphqlEndpoint, {
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
 * @param queryOrAST.query
 * @param variables query arguments
 * @param queryOrAST.variables
 * @param {SWRConfiguration} [options] - optional SWR options
 * @returns {SWRResponse}
 */
export default function useGraphQL({ query: queryOrAST, variables }, options) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)

  return useSWR({ query, variables, sessionToken }, fetcher, options)
}

export function useMutation() {
  const sessionToken = useSelector((state) => state.sessionToken)

  return runMutation.bind(null, { sessionToken })
}

export function runMutation(
  { sessionToken },
  { query: queryOrAST, variables }
) {
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)

  return request({
    query,
    variables,
    sessionToken,
    type: 'mutation',
  })
}

export function useMutate({ query: queryOrAST, variables }) {
  const sessionToken = useSelector((state) => state.sessionToken)
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)

  return useSWR({ query, variables, sessionToken })
}

export function useSWRKey() {
  const sessionToken = useSelector((state) => state.sessionToken)
  return ({ query: queryOrAST, variables }) => {
    const query =
      typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)
    return { query, variables, sessionToken }
  }
}

export function usePreload() {
  const sessionToken = useSelector((state) => state.sessionToken)
  return ({ query: queryOrAST, variables }) => {
    const query =
      typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)
    return preload({ query, variables, sessionToken }, fetcher)
  }
}
