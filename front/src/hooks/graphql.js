import { print } from 'graphql/language/printer'
import { useSelector } from 'react-redux'
import useSWR from 'swr'
import { executeQuery } from '../helpers/graphQL.js'

async function fetch({ query, variables, sessionToken }) {
  return executeQuery({
    query,
    variables,
    sessionToken,
    type: 'fetch',
  })
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

  return useSWR({ query, variables, sessionToken }, fetch, options)
}

/**
 * @deprecated
 */
export function useMutation() {
  const sessionToken = useSelector((state) => state.sessionToken)

  return runMutation.bind(null, { sessionToken })
}

/**
 * @deprecated
 */
export function runMutation(
  { sessionToken },
  { query: queryOrAST, variables }
) {
  const query = typeof queryOrAST === 'string' ? queryOrAST : print(queryOrAST)

  return executeQuery({
    query,
    variables,
    sessionToken,
    type: 'mutation',
  })
}

/**
 * @deprecated
 */
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
